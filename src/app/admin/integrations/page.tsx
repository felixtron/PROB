import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isManaged, isStandalone } from "@/lib/platform-mode"
import { IntegrationsForm } from "@/components/admin/IntegrationsForm"

export const dynamic = "force-dynamic"

export default async function IntegrationsPage() {
  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  const settings = await db.integrationSettings.findUnique({ where: { tenantId: tenant.id } })

  const reqHeaders = await headers()
  const host = reqHeaders.get("x-tenant-host") ?? reqHeaders.get("host") ?? "localhost"
  const isLocal = host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("::1")
  const protocol = isLocal ? "http" : "https"
  const webhookUrl = `${protocol}://${host}/api/webhooks/stripe/${tenant.id}`

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Integraciones</h1>
        <p className="muted" style={{ maxWidth: 720, margin: 0 }}>
          Llaves de Stripe y configuración de Evolution para este tenant. Los secretos se guardan en la base de datos y
          nunca se muestran de vuelta — para reemplazarlos, ingresa uno nuevo.
        </p>
      </div>

      <IntegrationsForm
        mode={isManaged() ? "managed" : "standalone"}
        webhookUrl={webhookUrl}
        initialState={{
          hasStripeSecret: Boolean(settings?.stripeSecretKey),
          hasStripeWebhookSecret: Boolean(settings?.stripeWebhookSecret),
          hasEvolutionApiKey: Boolean(settings?.evolutionApiKey),
          stripePublishableKeyHint: settings?.stripePublishableKeyHint ?? "",
          evolutionBaseUrl: settings?.evolutionBaseUrl ?? "",
          evolutionInstance: settings?.evolutionInstance ?? "",
        }}
      />
    </div>
  )
}
