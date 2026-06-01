"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireTenantAdmin } from "@/lib/auth"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"
import { testStripeKey } from "@/lib/stripe"
import { testEvolution } from "@/lib/evolution"

export type IntegrationsState = { ok: boolean; message?: string }

async function resolveTenantId() {
  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) throw new Error("Tenant no resuelto.")
  await requireTenantAdmin(tenant.id)
  return tenant.id
}

const optionalStr = z.string().trim().optional().or(z.literal("")).default("")

const updateSchema = z.object({
  stripePublishableKeyHint: optionalStr,
  stripeSecretKey: optionalStr,
  stripeWebhookSecret: optionalStr,
  evolutionBaseUrl: optionalStr,
  evolutionInstance: optionalStr,
  evolutionApiKey: optionalStr,
})

export async function updateIntegrationsAction(
  _: IntegrationsState,
  formData: FormData,
): Promise<IntegrationsState> {
  const tenantId = await resolveTenantId()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: "Datos inválidos." }
  const data = parsed.data

  const existing = await db.integrationSettings.findUnique({ where: { tenantId } })

  // Secrets: empty input preserves existing value (so users don't have to re-paste keys on every save).
  const nextStripeSecret = data.stripeSecretKey || existing?.stripeSecretKey || null
  const nextStripeWebhook = data.stripeWebhookSecret || existing?.stripeWebhookSecret || null
  const nextEvolutionApiKey = data.evolutionApiKey || existing?.evolutionApiKey || null

  const nextPublishable = data.stripePublishableKeyHint || null
  const nextBaseUrl = data.evolutionBaseUrl || null
  const nextInstance = data.evolutionInstance || null

  const stripeEnabled = Boolean(nextStripeSecret)
  const evolutionEnabled = Boolean(nextBaseUrl && nextInstance && nextEvolutionApiKey)

  await db.integrationSettings.upsert({
    where: { tenantId },
    create: {
      tenantId,
      stripeSecretKey: nextStripeSecret,
      stripeWebhookSecret: nextStripeWebhook,
      stripePublishableKeyHint: nextPublishable,
      stripeEnabled,
      evolutionBaseUrl: nextBaseUrl,
      evolutionInstance: nextInstance,
      evolutionApiKey: nextEvolutionApiKey,
      evolutionEnabled,
    },
    update: {
      stripeSecretKey: nextStripeSecret,
      stripeWebhookSecret: nextStripeWebhook,
      stripePublishableKeyHint: nextPublishable,
      stripeEnabled,
      evolutionBaseUrl: nextBaseUrl,
      evolutionInstance: nextInstance,
      evolutionApiKey: nextEvolutionApiKey,
      evolutionEnabled,
    },
  })

  revalidatePath("/admin/integrations")
  revalidatePath("/admin")
  return { ok: true, message: "Integraciones guardadas." }
}

export async function testStripeAction(_state: IntegrationsState, _formData: FormData): Promise<IntegrationsState> {
  void _state
  void _formData
  const tenantId = await resolveTenantId()
  const settings = await db.integrationSettings.findUnique({ where: { tenantId } })
  if (!settings?.stripeSecretKey) return { ok: false, message: "No hay llave de Stripe guardada. Guarda primero." }
  const result = await testStripeKey(settings.stripeSecretKey)
  return { ok: result.ok, message: result.message }
}

const testEvolutionSchema = z.object({
  number: z.string().trim().min(8, "Número inválido"),
  text: z.string().trim().min(1, "Texto requerido"),
})

export async function testEvolutionAction(
  _: IntegrationsState,
  formData: FormData,
): Promise<IntegrationsState> {
  const tenantId = await resolveTenantId()
  const parsed = testEvolutionSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: "Número y texto requeridos." }

  const settings = await db.integrationSettings.findUnique({ where: { tenantId } })
  if (!settings?.evolutionBaseUrl || !settings.evolutionInstance || !settings.evolutionApiKey) {
    return { ok: false, message: "Evolution no configurado. Guarda primero." }
  }

  const result = await testEvolution(
    { baseUrl: settings.evolutionBaseUrl, instance: settings.evolutionInstance, apiKey: settings.evolutionApiKey },
    parsed.data.number,
    parsed.data.text,
  )
  return { ok: result.ok, message: result.ok ? "Mensaje enviado." : result.error ?? "Error" }
}
