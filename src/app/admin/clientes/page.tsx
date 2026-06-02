import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ClientForm } from "@/components/admin/ClientForm"

export const dynamic = "force-dynamic"

export default async function ClientesPage() {
  const tenant = await resolveCurrentTenant()
  const clients = await db.clientProfile.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookingRequests: true, events: true } },
    },
  })

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Clientes</h1>
        <p className="muted" style={{ margin: 0 }}>
          CRM básico de clientes. Las cotizaciones y eventos se vinculan aquí desde Centro de Ventas.
        </p>
      </div>

      <ClientForm
        mode="create"
        initialValues={{
          name: "",
          email: "",
          phone: "",
          whatsapp: "",
          company: "",
          rfc: "",
          notes: "",
          city: "",
          state: "",
        }}
      />

      {clients.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Sin clientes en CRM. Agrega el primero arriba.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {clients.map((c) => (
            <ClientForm
              key={c.id}
              mode="edit"
              initialValues={{
                id: c.id,
                name: c.name,
                email: c.email ?? "",
                phone: c.phone ?? "",
                whatsapp: c.whatsapp ?? "",
                company: c.company ?? "",
                rfc: c.rfc ?? "",
                notes: c.notes ?? "",
                city: c.city ?? "",
                state: c.state ?? "",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
