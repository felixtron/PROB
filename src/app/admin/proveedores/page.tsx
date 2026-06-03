import { Truck, CheckCircle2, Folder } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ProviderForm } from "@/components/admin/ProviderForm"
import { Card } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function ProveedoresPage() {
  const tenant = await resolveCurrentTenant()
  const providers = await db.provider.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
  })

  const activeCount = providers.filter((p) => p.active).length
  const categoriesSet = new Set(providers.map((p) => p.category || "Sin categoría"))

  const grouped = new Map<string, typeof providers>()
  for (const p of providers) {
    const key = p.category || "Sin categoría"
    const existing = grouped.get(key)
    if (existing) {
      existing.push(p)
    } else {
      grouped.set(key, [p])
    }
  }

  const kpis = [
    { label: "Total", value: providers.length, icon: Truck, accent: "text-primary" },
    { label: "Activos", value: activeCount, icon: CheckCircle2, accent: "text-green-600" },
    { label: "Categorías", value: categoriesSet.size, icon: Folder, accent: "text-blue-600" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Proveedores</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Audio, iluminación, foto/video, transporte y todo lo que se subcontrata para un evento.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="bg-card border-border/40 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Icon className={`w-4 h-4 ${kpi.accent}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{kpi.label}</span>
              </div>
              <div className="text-2xl font-black text-foreground">{kpi.value}</div>
            </Card>
          )
        })}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">
          Nuevo proveedor
        </h2>
        <ProviderForm
          mode="create"
          tenantCurrency={tenant.currency}
          initialValues={{
            name: "",
            category: "",
            contactName: "",
            email: "",
            phone: "",
            whatsapp: "",
            city: "",
            baseRate: "",
            currency: "",
            notes: "",
            active: true,
          }}
        />
      </div>

      {providers.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Aún no hay proveedores. Agrega el primero arriba.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                {category} · {items.length}
              </h2>
              {items.map((p) => (
                <ProviderForm
                  key={p.id}
                  mode="edit"
                  tenantCurrency={tenant.currency}
                  initialValues={{
                    id: p.id,
                    name: p.name,
                    category: p.category ?? "",
                    contactName: p.contactName ?? "",
                    email: p.email ?? "",
                    phone: p.phone ?? "",
                    whatsapp: p.whatsapp ?? "",
                    city: p.city ?? "",
                    baseRate: p.baseRate ?? "",
                    currency: p.currency ?? "",
                    notes: p.notes ?? "",
                    active: p.active,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
