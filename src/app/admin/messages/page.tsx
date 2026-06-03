import { MessageSquare } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { CreateTemplateForm, EditTemplateForm } from "@/components/admin/MessageTemplateForm"
import { Card } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function MessagesPage() {
  const tenant = await resolveCurrentTenant()
  const templates = await db.messageTemplate.findMany({
    where: { tenantId: tenant.id },
    orderBy: { key: "asc" },
  })

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Plantillas de mensajes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Plantillas reutilizables para WhatsApp. El código las invoca por <code className="px-1.5 py-0.5 rounded bg-muted text-xs">key</code> sustituyendo{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-xs">{`{{variable}}`}</code> por valores en tiempo de envío.
        </p>
      </div>

      <Card className="bg-card border-border/40 p-4 rounded-xl shadow-sm mb-8 max-w-xs">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Plantillas</span>
        </div>
        <div className="text-2xl font-black text-foreground">{templates.length}</div>
      </Card>

      <div className="mb-6">
        <CreateTemplateForm />
      </div>

      {templates.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">Aún no hay plantillas. Crea la primera arriba.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Catálogo · {templates.length}
          </h2>
          {templates.map((t) => (
            <EditTemplateForm key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  )
}
