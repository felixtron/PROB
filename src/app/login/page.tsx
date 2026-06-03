import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"
import { LoginForm } from "@/components/auth/LoginForm"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user) redirect(user.role === "SUPER_ADMIN" ? "/super-admin" : "/admin")

  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())

  const brandTitle = tenant?.name ?? "PROB"
  const brandColor = tenant?.primaryColor ?? null

  return (
    <div
      className="admin-theme"
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
      }}
    >
      <main style={{ width: "100%", maxWidth: 460, display: "grid", gap: 32 }}>
        <div style={{ textAlign: "center", display: "grid", gap: 8 }}>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: "0.05em",
              margin: 0,
              textTransform: "uppercase",
              color: brandColor ?? "var(--primary)",
            }}
          >
            {brandTitle}
          </h1>
          <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 15 }}>
            Inicia sesión en tu cuenta
          </p>
        </div>
        <LoginForm />
      </main>
    </div>
  )
}
