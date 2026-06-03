import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ProviderForm } from "@/components/admin/ProviderForm"

export const dynamic = "force-dynamic"

export default async function ProveedoresPage() {
  const tenant = await resolveCurrentTenant()
  const providers = await db.provider.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
  })

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

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Logística
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Proveedores</h1>
        <p className="muted" style={{ margin: 0 }}>
          Audio, iluminación, foto/video, transporte y todo lo que se subcontrata para un evento.
        </p>
      </div>

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

      {providers.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>
            Aún no hay proveedores. Agrega el primero arriba.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} style={{ display: "grid", gap: 12 }}>
              <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                {category} · {items.length}
              </p>
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
