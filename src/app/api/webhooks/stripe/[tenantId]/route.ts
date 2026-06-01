import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { db } from "@/lib/db"
import { verifyStripeWebhook } from "@/lib/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ tenantId: string }> }

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
