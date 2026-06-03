"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type SongActionState = { ok: boolean; message?: string }

const optionalStr = z.string().trim().optional().or(z.literal(""))

const baseSchema = z.object({
  title: z.string().trim().min(1, "Título requerido").max(200),
  artist: optionalStr,
  genre: optionalStr,
  language: optionalStr,
  era: optionalStr,
  durationMin: z.coerce.number().int().min(0).max(60).optional().or(z.literal("")),
  songKey: optionalStr,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  active: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
})

const createSchema = baseSchema
const updateSchema = baseSchema.extend({ id: z.string().min(1) })

export async function createSongAction(
  _state: SongActionState,
  formData: FormData,
): Promise<SongActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  await db.song.create({
    data: {
      tenantId,
      title: parsed.data.title,
      artist: parsed.data.artist || null,
      genre: parsed.data.genre || null,
      language: parsed.data.language || null,
      era: parsed.data.era || null,
      durationMin: typeof parsed.data.durationMin === "number" ? parsed.data.durationMin : null,
      songKey: parsed.data.songKey || null,
      notes: parsed.data.notes || null,
      active: parsed.data.active,
    },
  })

  revalidatePath("/admin/repertorio")
  return { ok: true, message: "Canción agregada." }
}

export async function updateSongAction(
  _state: SongActionState,
  formData: FormData,
): Promise<SongActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const result = await db.song.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      title: parsed.data.title,
      artist: parsed.data.artist || null,
      genre: parsed.data.genre || null,
      language: parsed.data.language || null,
      era: parsed.data.era || null,
      durationMin: typeof parsed.data.durationMin === "number" ? parsed.data.durationMin : null,
      songKey: parsed.data.songKey || null,
      notes: parsed.data.notes || null,
      active: parsed.data.active,
    },
  })
  if (result.count === 0) return { ok: false, message: "Canción no encontrada." }

  revalidatePath("/admin/repertorio")
  return { ok: true, message: "Cambios guardados." }
}

export async function deleteSongAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.song.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/repertorio")
}
