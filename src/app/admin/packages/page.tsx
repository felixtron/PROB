import { ShoppingBag, CheckCircle2, Eye } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { PackageForm } from "@/components/admin/PackageForm"
import { Card } from "@/components/ui/card"

export const dynamic = "force-dynamic"

function parseIncludes(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

export default async function PackagesPage() {
  const tenant = await resolveCurrentTenant()
  const packages = await db.servicePackage.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ active: "desc" }, { basePrice: "asc" }],
  })

  const activeCount = packages.filter((p) => p.active).length

  const kpis = [
    { label: "Total", value: packages.length, icon: ShoppingBag, accent: "text-primary" },
    { label: "Activos", value: activeCount, icon: CheckCircle2, accent: "text-green-600" },
    { label: "Visibles al cliente", value: activeCount, icon: Eye, accent: "text-blue-600" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Catálogo de Paquetes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Servicios o paquetes que ofreces a clientes. Solo los marcados como activos aparecen en el flujo de compra.
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
          Nuevo paquete
        </h2>
        <PackageForm
          mode="create"
          initialValues={{
            name: "",
            description: "",
            basePrice: 0,
            minDuration: 1,
            includes: "",
            active: true,
          }}
        />
      </div>

      {packages.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">Aún no hay paquetes. Crea el primero arriba.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Catálogo · {packages.length}
          </h2>
          {packages.map((p) => (
            <PackageForm
              key={p.id}
              mode="edit"
              initialValues={{
                id: p.id,
                name: p.name,
                description: p.description ?? "",
                basePrice: p.basePrice,
                minDuration: p.minDuration,
                includes: parseIncludes(p.includesJson).join("\n"),
                active: p.active,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
