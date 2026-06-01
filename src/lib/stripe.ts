import Stripe from "stripe"
import { db } from "@/lib/db"

const STRIPE_API_VERSION = "2026-05-27.dahlia" as const

export async function getStripeClient(tenantId: string) {
  const settings = await db.integrationSettings.findUnique({ where: { tenantId } })
  const secret = settings?.stripeSecretKey
  if (!secret) throw new Error("Stripe no está configurado para este tenant.")
  return new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
}

export async function verifyStripeWebhook(tenantId: string, rawBody: string, signature: string | null) {
  const settings = await db.integrationSettings.findUnique({ where: { tenantId } })
  const webhookSecret = settings?.stripeWebhookSecret
  if (!webhookSecret) throw new Error("Webhook secret no configurado para este tenant.")
  if (!signature) throw new Error("Falta el header stripe-signature.")
  const stripe = new Stripe(settings?.stripeSecretKey ?? "sk_invalid", { apiVersion: STRIPE_API_VERSION })
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
}

export type StripeKeyTestResult = { ok: boolean; message: string }

export async function testStripeKey(secret: string): Promise<StripeKeyTestResult> {
  if (!secret) return { ok: false, message: "Sin llave para probar." }
  try {
    const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
    const balance = await stripe.balance.retrieve()
    const available = balance.available?.map((b) => `${b.amount / 100} ${b.currency.toUpperCase()}`).join(", ")
    return { ok: true, message: `Conexión OK. Balance disponible: ${available || "0"}.` }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return { ok: false, message: msg }
  }
}
