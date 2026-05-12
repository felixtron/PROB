import { headers } from "next/headers"
import { db } from "@/lib/db"
import { extractPlatformSlug, getPlatformHostname, normalizeHostname } from "@/lib/tenant-routing"

export function slugifyTenantName(name: string) {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "tenant"
}

export async function getCurrentTenant() {
  const requestHeaders = await headers()
  const host = normalizeHostname(requestHeaders.get("x-tenant-host") ?? requestHeaders.get("host"))
  if (!host) return null

  const platformSlug = requestHeaders.get("x-tenant-slug") ?? extractPlatformSlug(host, getPlatformHostname())

  if (platformSlug) {
    return db.tenant.findFirst({
      where: {
        slug: platformSlug,
        status: "ACTIVE",
        domains: { some: { hostname: host, status: "ACTIVE" } },
      },
    })
  }

  return db.tenant.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ primaryDomain: host }, { domains: { some: { hostname: host, status: "ACTIVE" } } }],
    },
  })
}

export async function getInstalledTenant() {
  const state = await db.installationState.findUnique({ where: { id: "singleton" } })
  if (!state?.tenantId) return null
  return db.tenant.findUnique({ where: { id: state.tenantId } })
}
