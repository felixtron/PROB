import { getStripeClient } from "@/lib/stripe"
import { db } from "@/lib/db"

export type CheckoutResult =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; error: string }

/**
 * Creates a Stripe Checkout Session for the deposit (anticipo) of a booking.
 *
 * Idempotency: callers that want to avoid generating multiple sessions should
 * check `BookingRequest.paymentStatus === "completed"` before invoking. Stripe
 * will create a new session each call; the webhook is what mutates booking
 * state, and it's idempotent via stripePaymentIntentId unique key.
 *
 * Cross-tenant defense: the booking is re-read and matched against tenantId.
 * Metadata embeds `bookingRequestId` and `tenantId` so the webhook can scope
 * the booking update back to the right tenant.
 */
export async function createDepositCheckoutSession(
  tenantId: string,
  bookingRequestId: string,
  appOrigin: string,
): Promise<CheckoutResult> {
  const booking = await db.bookingRequest.findFirst({
    where: { id: bookingRequestId, tenantId },
    select: {
      id: true,
      shortCode: true,
      clientName: true,
      clientEmail: true,
      packageName: true,
      depositAmount: true,
      baseAmount: true,
      paymentStatus: true,
    },
  })
  if (!booking) return { ok: false, error: "Cotización no encontrada." }
  if (booking.paymentStatus === "completed") {
    return { ok: false, error: "Esta cotización ya está pagada." }
  }
  // Charge depositAmount if > 0, fallback to baseAmount.
  const amount = booking.depositAmount > 0 ? booking.depositAmount : booking.baseAmount
  if (amount <= 0) return { ok: false, error: "Esta cotización no tiene monto a cobrar." }

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { currency: true, name: true },
  })
  const currency = (tenant?.currency ?? "mxn").toLowerCase()

  let stripe: Awaited<ReturnType<typeof getStripeClient>>
  try {
    stripe = await getStripeClient(tenantId)
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return { ok: false, error: msg }
  }

  const productName = booking.packageName
    ? `Anticipo — ${booking.packageName}`
    : `Anticipo — Cotización ${booking.shortCode}`
  const description = `Reserva código ${booking.shortCode}${tenant?.name ? ` · ${tenant.name}` : ""}`

  const successUrl = `${appOrigin}/cotizar/exito/${booking.shortCode}/pago/exito?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${appOrigin}/cotizar/exito/${booking.shortCode}/pago/cancelado`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: productName,
              description,
            },
          },
        },
      ],
      customer_email: booking.clientEmail ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingRequestId: booking.id,
        bookingShortCode: booking.shortCode,
        tenantId,
        purpose: "deposit",
      },
      payment_intent_data: {
        metadata: {
          bookingRequestId: booking.id,
          bookingShortCode: booking.shortCode,
          tenantId,
          purpose: "deposit",
        },
      },
    })
    if (!session.url) return { ok: false, error: "Stripe no devolvió URL de pago." }
    return { ok: true, url: session.url, sessionId: session.id }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error creando sesión de Stripe."
    return { ok: false, error: msg }
  }
}
