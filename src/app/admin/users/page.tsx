import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { InviteUserForm, DeleteUserButton } from "@/components/admin/InviteUserForm"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const tenant = await resolveCurrentTenant()
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const users = await db.user.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  })

  const tenantAdminCount = users.filter((u) => u.role === "TENANT_ADMIN").length

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Usuarios</h1>
        <p className="muted" style={{ margin: 0 }}>
          Equipo con acceso a este tenant. Solo los admins ven esta página.
        </p>
      </div>

      <InviteUserForm />

      <div className="card" style={{ padding: 4, overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Creado</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === session.id
              const isLastAdmin = u.role === "TENANT_ADMIN" && tenantAdminCount <= 1
              let disabledReason: string | undefined
              if (isSelf) disabledReason = "tú mismo"
              else if (isLastAdmin) disabledReason = "último admin"

              return (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name ?? "—"}</td>
                  <td>
                    <code style={{ fontSize: 12 }}>{u.role}</code>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{u.createdAt.toISOString().slice(0, 10)}</td>
                  <td style={{ textAlign: "right" }}>
                    <DeleteUserButton
                      id={u.id}
                      disabled={Boolean(disabledReason)}
                      disabledReason={disabledReason}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
