import { redirect } from "next/navigation"
import { isInstalled } from "@/lib/install"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"
import { requireTenantAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isInstalled())) redirect("/install")

  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  const user = await requireTenantAdmin(tenant.id)

  const pendingInbox = await db.inboxItem
    .count({ where: { tenantId: tenant.id, status: "pending" } })
    .catch(() => 0)

  return (
    <div className="admin-theme flex min-h-screen bg-background text-foreground p-4 gap-4">
      {/* Red top bar (Vendetta signature element) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-red-600 z-[99999] pointer-events-none" />

      <AdminSidebar
        user={{ name: user.name, email: user.email, role: user.role }}
        pendingInbox={pendingInbox}
        logoUrl={tenant.logoUrl}
        tenantName={tenant.name}
      />

      <main className="flex-1 overflow-auto rounded-3xl bg-transparent">
        <div className="h-full">{children}</div>
      </main>
    </div>
  )
}
