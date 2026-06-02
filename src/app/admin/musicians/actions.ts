"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type MusicianActionState = { ok: boolean; message?: string }

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalEmail = z.string().trim().email("Email inválido").or(z.literal("")).optional()
const optionalUrl = z.string().trim().url("URL inválida").or(z.literal("")).optional()

const baseSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido").max(120),
  role: optionalStr,
  instruments: optionalStr,
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  email: optionalEmail,
  whatsapp: optionalStr,
  photoUrl: optionalUrl,
  active: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
})

const createSchema = baseSchema
const updateSchema = baseSchema.extend({ id: z.string().min(1) })

function instrumentsToJson(raw: string | undefined) {
  if (!raw) return "[]"
  const items = raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  return JSON.stringify(items)
}

export async function createMusicianAction(
  _state: MusicianActionState,
  formData: FormData,
): Promise<MusicianActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  await db.musician.create({
    data: {
      tenantId,
      name: parsed.data.name,
      role: parsed.data.role || null,
      instruments: instrumentsToJson(parsed.data.instruments),
      bio: parsed.data.bio || null,
      email: parsed.data.email || null,
      whatsapp: parsed.data.whatsapp || null,
      photoUrl: parsed.data.photoUrl || null,
      active: parsed.data.active,
    },
  })

  revalidatePath("/admin/musicians")
  revalidatePath("/admin")
  return { ok: true, message: "Músico agregado." }
}

export async function updateMusicianAction(
  _state: MusicianActionState,
  formData: FormData,
): Promise<MusicianActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const result = await db.musician.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      name: parsed.data.name,
      role: parsed.data.role || null,
      instruments: instrumentsToJson(parsed.data.instruments),
      bio: parsed.data.bio || null,
      email: parsed.data.email || null,
      whatsapp: parsed.data.whatsapp || null,
      photoUrl: parsed.data.photoUrl || null,
      active: parsed.data.active,
    },
  })
  if (result.count === 0) return { ok: false, message: "Músico no encontrado." }

  revalidatePath("/admin/musicians")
  revalidatePath("/admin")
  return { ok: true, message: "Cambios guardados." }
}

export async function deleteMusicianAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.musician.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/musicians")
  revalidatePath("/admin")
}
