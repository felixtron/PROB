import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { isInstalled } from "@/lib/install"

export default async function AdminPage() {
  if (!(await isInstalled())) redirect("/install")

  const [organization, users, packages, integrations] = await Promise.all([
    db.organization.findUnique({ where: { id: "singleton" } }),
    db.user.count(),
    db.servicePackage.count(),
    db.integrationSettings.findUnique({ where: { id: "singleton" } }),
  ])

  return (
    <main className="page-shell" style={{ padding: "48px 0" }}>
      <h1>Admin · {organization?.name}</h1>
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
