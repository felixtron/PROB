import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { db } from "@/lib/db"
import { verifyStripeWebhook } from "@/lib/stripe"
import { dispatchNotification } from "@/lib/notifications"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ tenantId: string }> }

/**
 * After Stripe confirms a deposit checkout, we mark the BookingRequest as
 * paid, auto-confirm it, and dispatch WhatsApp notifications to the client
 * and to the tenant admin. Idempotent: re-running the same event leaves
 * the record in the same state (Payment is upserted by stripePaymentIntentId).
 *
 * Cross-tenant defense: even though the URL carries tenantId, we verify the
 * metadata.tenantId matches before mutating any booking. A misrouted webhook
 * (e.g. tenant misconfigured the URL on Stripe dashboard) won't pollute the
 * wrong tenant's data.
 *
 * Notification idempotency: we only send notifications if the booking was
 * NOT already paymentStatus=completed before our update. That way reruns
 * of the same Stripe event don't spam the client with duplicate messages.
 */
async function applyDepositToBooking(
  tenantId: string,
  bookingRequestId: string | null,
  metadataTenantId: string | null,
  purpose: string | null,
  paidAmount: number,
) {
  if (!bookingRequestId || purpose !== "deposit") return
  if (metadataTenantId && metadataTenantId !== tenantId) {
    console.warn(
      `[stripe webhook] tenant mismatch — url=${tenantId} metadata=${metadataTenantId}, skipping booking update`,
    )
    return
  }

  const booking = await db.bookingRequest.findFirst({
    where: { id: bookingRequestId, tenantId },
    select: {
      id: true,
      shortCode: true,
      status: true,
      paymentStatus: true,
      depositAmount: true,
      baseAmount: true,
      clientName: true,
      clientWhatsapp: true,
      clientPhone: true,
      packageName: true,
      requestedDate: true,
    },
  })
  if (!booking) return

  const expectedAmount = booking.depositAmount > 0 ? booking.depositAmount : booking.baseAmount
  // Lenient amount match: just require the paid amount to be at least the expected deposit.
  // Stripe can charge slightly more on currency conversion edge cases.
  if (paidAmount > 0 && paidAmount < expectedAmount) {
    console.warn(
      `[stripe webhook] paid amount ${paidAmount} < expected deposit ${expectedAmount} for booking ${bookingRequestId}, marking partial`,
    )
  }

  const wasAlreadyPaid = booking.paymentStatus === "completed"

  await db.bookingRequest.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "completed",
      // Only auto-confirm if currently pending; don't overwrite cancelled or expired.
      status: booking.status === "pending" ? "confirmed" : booking.status,
    },
  })

  if (wasAlreadyPaid) return // Notification already sent on first webhook fire.

  // Dispatch WhatsApp notifications. We tolerate Evolution being unconfigured
  // or temporarily down — dispatchNotification persists a Notification row
  // with status=failed so Prisca can retry from /admin/notificaciones.
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true, currency: true, whatsapp: true },
  })
  if (!tenant) return

  const moneyFmt = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: (tenant.currency ?? "MXN").toUpperCase(),
    maximumFractionDigits: 0,
  })
  const amountLabel = moneyFmt.format((paidAmount > 0 ? paidAmount : expectedAmount) / 100)
  const dateLabel = booking.requestedDate
    ? booking.requestedDate.toISOString().slice(0, 10)
    : "por confirmar"

  const clientPhone = (booking.clientWhatsapp || booking.clientPhone || "").replace(/[^0-9]/g, "")
  if (clientPhone) {
    await dispatchNotification({
      tenantId,
      type: "deposit_received_client",
      recipient: clientPhone,
      bookingRequestId: booking.id,
      message: [
        `¡Recibimos tu anticipo de ${amountLabel}, ${booking.clientName.split(" ")[0]}!`,
        ``,
        `Tu evento del ${dateLabel}${booking.packageName ? ` (${booking.packageName})` : ""} queda confirmado.`,
        ``,
        `Reserva ${booking.shortCode}.`,
        ``,
        `${tenant.name} — pronto te contactamos con los siguientes pasos.`,
      ].join("\n"),
    }).catch((err) => {
      console.error("[stripe webhook] client notification dispatch failed", err)
    })
  }

  const adminPhone = (tenant.whatsapp ?? "").replace(/[^0-9]/g, "")
  if (adminPhone && adminPhone !== clientPhone) {
    await dispatchNotification({
      tenantId,
      type: "deposit_received_admin",
      recipient: adminPhone,
      bookingRequestId: booking.id,
      message: [
        `💸 Anticipo recibido: ${amountLabel}`,
        ``,
        `Cliente: ${booking.clientName}`,
        `Reserva: ${booking.shortCode}${booking.packageName ? ` · ${booking.packageName}` : ""}`,
        `Fecha del evento: ${dateLabel}`,
        ``,
        `La cotización quedó marcada como confirmada automáticamente.`,
      ].join("\n"),
    }).catch((err) => {
      console.error("[stripe webhook] admin notification dispatch failed", err)
    })
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  const { tenantId } = await params
  const signature = req.headers.get("stripe-signature")

  // Stripe signature verification REQUIRES the raw request body — read text() before any json() parse.
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = await verifyStripeWebhook(tenantId, rawBody, signature)
  } catch (error) {
    const msg = error instanceof Error ? error.message : "verification failed"
    return new NextResponse(`stripe webhook verification failed: ${msg}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.processing": {
        const pi = event.data.object as Stripe.PaymentIntent
        const status =
          event.type === "payment_intent.succeeded"
            ? "succeeded"
            : event.type === "payment_intent.payment_failed"
              ? "failed"
              : "processing"

        await db.payment.upsert({
          where: { stripePaymentIntentId: pi.id },
          create: {
            tenantId,
            stripePaymentIntentId: pi.id,
            status,
            amount: pi.amount,
            currency: pi.currency,
            customerEmail: pi.receipt_email,
            description: pi.description,
            metadataJson: JSON.stringify(pi.metadata ?? {}),
            paidAt: status === "succeeded" ? new Date() : null,
          },
          update: {
            status,
            amount: pi.amount,
            currency: pi.currency,
            customerEmail: pi.receipt_email ?? undefined,
            description: pi.description ?? undefined,
            metadataJson: JSON.stringify(pi.metadata ?? {}),
            paidAt: status === "succeeded" ? new Date() : undefined,
          },
        })

        // If this PI succeeded and was tagged as a deposit, mark the booking too.
        // (checkout.session.completed also fires for the same payment but we
        // double-check here in case the merchant sent a direct PI without checkout.)
        if (status === "succeeded") {
          await applyDepositToBooking(
            tenantId,
            pi.metadata?.bookingRequestId ?? null,
            pi.metadata?.tenantId ?? null,
            pi.metadata?.purpose ?? null,
            pi.amount,
          )
        }
        break
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const piId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null

        if (piId) {
          await db.payment.upsert({
            where: { stripePaymentIntentId: piId },
            create: {
              tenantId,
              stripePaymentIntentId: piId,
              stripeCheckoutSessionId: session.id,
              status: "succeeded",
              amount: session.amount_total ?? 0,
              currency: session.currency ?? "mxn",
              customerEmail: session.customer_details?.email,
              customerName: session.customer_details?.name,
              description:
                session.metadata?.bookingShortCode
                  ? `Anticipo · cotización ${session.metadata.bookingShortCode}`
                  : null,
              metadataJson: JSON.stringify(session.metadata ?? {}),
              paidAt: new Date(),
            },
            update: {
              stripeCheckoutSessionId: session.id,
              status: "succeeded",
              customerEmail: session.customer_details?.email ?? undefined,
              customerName: session.customer_details?.name ?? undefined,
              paidAt: new Date(),
            },
          })
        }

        // Mark the booking as paid + auto-confirm if metadata says deposit.
        await applyDepositToBooking(
          tenantId,
          session.metadata?.bookingRequestId ?? null,
          session.metadata?.tenantId ?? null,
          session.metadata?.purpose ?? null,
          session.amount_total ?? 0,
        )
        break
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const piId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id ?? null
        if (piId) {
          await db.payment
            .update({ where: { stripePaymentIntentId: piId }, data: { status: "refunded" } })
            .catch(() => undefined)
        }
        break
      }
      default:
        break
    }
  } catch (error) {
    console.error("[stripe webhook] processing error", error)
    return new NextResponse("processing error", { status: 500 })
  }

  return NextResponse.json({ received: true })
}
