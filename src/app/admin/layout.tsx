import Link from "next/link"
import { redirect } from "next/navigation"
import { isInstalled } from "@/lib/install"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"
import { requireTenantAdmin } from "@/lib/auth"
import { LogoutButton } from "@/components/auth/LogoutButton"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isInstalled())) redirect("/install")

  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  const user = await requireTenantAdmin(tenant.id)

  return (
    <>
      <header
        className="page-shell"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", gap: 16 }}
      >
        <Link href="/admin" style={{ textDecoration: "none", fontWeight: 800 }}>
          {tenant.name}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="muted">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      {children}
    </>
  )
}
