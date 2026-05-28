import { notFound, redirect } from "next/navigation"
import { hasSuperAdmin } from "@/lib/auth"
import { isStandalone } from "@/lib/platform-mode"
import { SetupForm } from "@/components/super-admin/SetupForm"

export const dynamic = "force-dynamic"

export default async function SuperAdminSetupPage() {
  if (isStandalone()) notFound()
  if (await hasSuperAdmin()) redirect("/super-admin")

  return (
    <main className="page-shell" style={{ padding: "48px 0", display: "grid", gap: 24, maxWidth: 460 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          PROB Platform
        </p>
        <h1 style={{ fontSize: 36, margin: "8px 0" }}>Configurar super admin</h1>
        <p className="muted" style={{ margin: 0 }}>
          Crea la primera cuenta de plataforma. Este paso se bloquea una vez creado.
        </p>
      </div>
      <SetupForm />
    </main>
  )
}
