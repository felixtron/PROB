import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { CreateTemplateForm, EditTemplateForm } from "@/components/admin/MessageTemplateForm"

export const dynamic = "force-dynamic"

export default async function MessagesPage() {
  const tenant = await resolveCurrentTenant()
  const templates = await db.messageTemplate.findMany({
    where: { tenantId: tenant.id },
    orderBy: { key: "asc" },
  })

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Mensajes</h1>
        <p className="muted" style={{ margin: 0 }}>
          Plantillas reutilizables para WhatsApp. El código las invoca por <code>key</code> sustituyendo
          {" "}<code>{`{{variable}}`}</code>{" "}por valores en tiempo de envío.
        </p>
      </div>

      <CreateTemplateForm />

      {templates.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Aún no hay plantillas. Crea la primera arriba.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {templates.map((t) => (
            <EditTemplateForm key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  )
}
