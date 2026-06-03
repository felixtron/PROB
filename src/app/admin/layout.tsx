import { redirect } from "next/navigation"
import { isInstalled } from "@/lib/install"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"
import { requireTenantAdmin } from "@/lib/auth"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { AdminNav } from "@/components/admin/AdminNav"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isInstalled())) redirect("/install")

  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  const user = await requireTenantAdmin(tenant.id)

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <header
        className="page-shell"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", gap: 16 }}
      >
        <span style={{ fontWeight: 800 }}>{tenant.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="muted">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <div className="admin-shell">
        <aside>
          <AdminNav logoUrl={tenant.logoUrl} tenantName={tenant.name} />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  )
}
