"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type ProviderActionState = { ok: boolean; message?: string }

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalEmail = z.string().trim().email("Email inválido").or(z.literal("")).optional()

const baseSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido").max(120),
  category: optionalStr,
  contactName: optionalStr,
  email: optionalEmail,
  phone: optionalStr,
  whatsapp: optionalStr,
  city: optionalStr,
  baseRate: z.coerce.number().int().min(0).max(99_999_999).optional().or(z.literal("")),
  currency: optionalStr,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  active: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
})

const updateSchema = baseSchema.extend({ id: z.string().min(1) })

export async function createProviderAction(
  _state: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  await db.provider.create({
    data: {
      tenantId,
      name: parsed.data.name,
      category: parsed.data.category || null,
      contactName: parsed.data.contactName || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      city: parsed.data.city || null,
      baseRate: typeof parsed.data.baseRate === "number" ? parsed.data.baseRate : null,
      currency: parsed.data.currency || null,
      notes: parsed.data.notes || null,
      active: parsed.data.active,
    },
  })

  revalidatePath("/admin/proveedores")
  return { ok: true, message: "Proveedor agregado." }
}

export async function updateProviderAction(
  _state: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const result = await db.provider.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      name: parsed.data.name,
      category: parsed.data.category || null,
      contactName: parsed.data.contactName || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      city: parsed.data.city || null,
      baseRate: typeof parsed.data.baseRate === "number" ? parsed.data.baseRate : null,
      currency: parsed.data.currency || null,
      notes: parsed.data.notes || null,
      active: parsed.data.active,
    },
  })
  if (result.count === 0) return { ok: false, message: "Proveedor no encontrado." }

  revalidatePath("/admin/proveedores")
  return { ok: true, message: "Cambios guardados." }
}

export async function deleteProviderAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.provider.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/proveedores")
}
