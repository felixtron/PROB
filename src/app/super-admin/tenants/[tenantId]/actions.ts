"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { normalizeHostname } from "@/lib/tenant-routing"
import { requireSuperAdmin } from "@/lib/auth"

const tenantStatusSchema = z.enum(["ACTIVE", "PAUSED", "DELETED"])

const updateTenantSchema = z.object({
  tenantId: z.string().min(1),
  status: tenantStatusSchema,
  revenueShareRate: z.coerce.number().min(0).max(100),
})

const addDomainSchema = z.object({
  tenantId: z.string().min(1),
  hostname: z.string().trim().min(3),
})

export async function updateTenantSettingsAction(formData: FormData) {
  await requireSuperAdmin()
  const parsed = updateTenantSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return

  const data = parsed.data
  await db.tenant.update({
    where: { id: data.tenantId },
    data: {
      status: data.status,
      revenueShareRate: data.revenueShareRate / 100,
    },
  })

  revalidatePath("/super-admin")
  revalidatePath(`/super-admin/tenants/${data.tenantId}`)
}

export async function addTenantDomainAction(formData: FormData) {
  await requireSuperAdmin()
  const parsed = addDomainSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return

  const hostname = normalizeHostname(parsed.data.hostname)
  if (!hostname) return

  await db.tenantDomain.create({
    data: {
      tenantId: parsed.data.tenantId,
      hostname,
      type: "CUSTOM_DOMAIN",
      status: "PENDING",
      verificationToken: crypto.randomUUID(),
    },
  })

  revalidatePath("/super-admin")
  revalidatePath(`/super-admin/tenants/${parsed.data.tenantId}`)
}

export async function activateTenantDomainAction(formData: FormData) {
  await requireSuperAdmin()
  const tenantId = String(formData.get("tenantId") || "")
  const domainId = String(formData.get("domainId") || "")
  const hostname = normalizeHostname(String(formData.get("hostname") || ""))

  if (!tenantId || !domainId || !hostname) return

  await db.$transaction([
    db.tenant.update({ where: { id: tenantId }, data: { primaryDomain: hostname } }),
    db.tenantDomain.update({
      where: { id: domainId },
      data: { status: "ACTIVE", verifiedAt: new Date() },
    }),
  ])

  revalidatePath("/super-admin")
  revalidatePath(`/super-admin/tenants/${tenantId}`)
}
