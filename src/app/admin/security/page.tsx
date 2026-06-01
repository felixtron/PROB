import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SecurityPage() {
  await resolveCurrentTenant()
  const user = await getSessionUser()
  if (!user) redirect("/login")

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 540 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Seguridad</h1>
        <p className="muted" style={{ margin: 0 }}>
          Cambia la contraseña de <strong>{user.email}</strong>. Al actualizar, otras sesiones abiertas en
          otros dispositivos quedarán cerradas automáticamente.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  )
}
