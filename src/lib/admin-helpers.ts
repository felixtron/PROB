import { redirect } from "next/navigation"
import { isInstalled } from "@/lib/install"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"
import { requireTenantAdmin } from "@/lib/auth"

export async function resolveCurrentTenant() {
  if (!(await isInstalled())) redirect("/install")
  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")
  return tenant
}

export async function resolveTenantIdForAdminAction() {
  const tenant = await resolveCurrentTenant()
  await requireTenantAdmin(tenant.id)
  return tenant.id
}
