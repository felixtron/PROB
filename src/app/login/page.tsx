import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"
import { LoginForm } from "@/components/auth/LoginForm"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user) redirect(user.role === "SUPER_ADMIN" ? "/super-admin" : "/admin")

  return (
    <main className="page-shell" style={{ padding: "48px 0", display: "grid", gap: 24, maxWidth: 460 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          PROB
        </p>
        <h1 style={{ fontSize: 36, margin: "8px 0" }}>Iniciar sesión</h1>
        <p className="muted" style={{ margin: 0 }}>
          Accede al panel de administración.
        </p>
      </div>
      <LoginForm />
    </main>
  )
}
