"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type PackageActionState = { ok: boolean; message?: string }

const baseSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  basePrice: z.coerce.number().min(0, "Precio no puede ser negativo"),
  minDuration: z.coerce.number().int().min(0, "Duración inválida"),
  includes: z.string().optional().or(z.literal("")),
  active: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
})

const createSchema = baseSchema
const updateSchema = baseSchema.extend({ id: z.string().min(1) })

function includesToJson(raw: string | undefined) {
  if (!raw) return "[]"
  const items = raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  return JSON.stringify(items)
}

export async function createPackageAction(
  _state: PackageActionState,
  formData: FormData,
): Promise<PackageActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  await db.servicePackage.create({
    data: {
      tenantId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      basePrice: parsed.data.basePrice,
      minDuration: parsed.data.minDuration,
      includesJson: includesToJson(parsed.data.includes),
      active: parsed.data.active,
    },
  })

  revalidatePath("/admin/packages")
  revalidatePath("/admin")
  return { ok: true, message: "Paquete creado." }
}

export async function updatePackageAction(
  _state: PackageActionState,
  formData: FormData,
): Promise<PackageActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const result = await db.servicePackage.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      basePrice: parsed.data.basePrice,
      minDuration: parsed.data.minDuration,
      includesJson: includesToJson(parsed.data.includes),
      active: parsed.data.active,
    },
  })
  if (result.count === 0) return { ok: false, message: "Paquete no encontrado." }

  revalidatePath("/admin/packages")
  revalidatePath("/admin")
  return { ok: true, message: "Paquete actualizado." }
}

export async function deletePackageAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.servicePackage.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/packages")
  revalidatePath("/admin")
}
