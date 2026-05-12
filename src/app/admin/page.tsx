import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { isInstalled } from "@/lib/install"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  if (!(await isInstalled())) redirect("/install")

  const tenant = (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  const [users, packages, integrations] = await Promise.all([
    db.user.count({ where: { tenantId: tenant.id } }),
    db.servicePackage.count({ where: { tenantId: tenant.id } }),
    db.integrationSettings.findUnique({ where: { tenantId: tenant.id } }),
  ])

  return (
    <main className="page-shell" style={{ padding: "48px 0" }}>
      <h1>Admin · {tenant.name}</h1>
      <p className="muted">Base instalada correctamente. Desde aquí puedes conectar módulos de dominio.</p>

      <div className="grid-3" style={{ marginTop: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <strong>Usuarios</strong>
          <p style={{ fontSize: 36, margin: "12px 0 0" }}>{users}</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <strong>Paquetes</strong>
          <p style={{ fontSize: 36, margin: "12px 0 0" }}>{packages}</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <strong>Integraciones</strong>
          <p className="muted">
            Stripe: {integrations?.stripeEnabled ? "activo" : "pendiente"}
            <br />
            Evolution: {integrations?.evolutionEnabled ? "activo" : "pendiente"}
          </p>
        </div>
      </div>
    </main>
  )
}
