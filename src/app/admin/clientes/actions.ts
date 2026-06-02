"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type ClientActionState = { ok: boolean; message?: string }

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalEmail = z.string().trim().email("Email inválido").or(z.literal("")).optional()

const baseSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido").max(160),
  email: optionalEmail,
  phone: optionalStr,
  whatsapp: optionalStr,
  company: optionalStr,
  rfc: optionalStr,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  city: optionalStr,
  state: optionalStr,
})

const updateSchema = baseSchema.extend({ id: z.string().min(1) })

export async function createClientAction(
  _state: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  await db.clientProfile.create({
    data: {
      tenantId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      company: parsed.data.company || null,
      rfc: parsed.data.rfc || null,
      notes: parsed.data.notes || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
    },
  })

  revalidatePath("/admin/clientes")
  revalidatePath("/admin")
  return { ok: true, message: "Cliente creado." }
}

export async function updateClientAction(
  _state: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const result = await db.clientProfile.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      company: parsed.data.company || null,
      rfc: parsed.data.rfc || null,
      notes: parsed.data.notes || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
    },
  })
  if (result.count === 0) return { ok: false, message: "Cliente no encontrado." }

  revalidatePath("/admin/clientes")
  revalidatePath("/admin")
  return { ok: true, message: "Cambios guardados." }
}

export async function deleteClientAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  // FK constraints on BookingRequest / Event use SET NULL so this is safe.
  await db.clientProfile.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/clientes")
  revalidatePath("/admin")
}
