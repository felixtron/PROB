import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { PackageForm } from "@/components/admin/PackageForm"

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

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Paquetes</h1>
        <p className="muted" style={{ margin: 0 }}>
          Servicios o paquetes que ofreces a clientes. Solo los marcados como activos se mostrarán cuando
          implementemos el flujo de compra.
        </p>
      </div>

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

      {packages.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Aún no hay paquetes. Crea el primero arriba.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
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
