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
  const evolutionWebhookUrl = `${protocol}://${host}/api/webhooks/evolution/${tenant.id}`

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Integraciones</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Llaves de Stripe y configuración de Evolution para este tenant. Los secretos se guardan en la base de datos y
          nunca se muestran de vuelta — para reemplazarlos, ingresa uno nuevo.
        </p>
      </div>

      <IntegrationsForm
        mode={isManaged() ? "managed" : "standalone"}
        webhookUrl={webhookUrl}
        evolutionWebhookUrl={evolutionWebhookUrl}
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
