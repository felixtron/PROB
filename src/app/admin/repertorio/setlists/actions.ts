"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type SetlistActionState = { ok: boolean; message?: string }

const optionalStr = z.string().trim().optional().or(z.literal(""))

const baseSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  active: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
})

const updateSchema = baseSchema.extend({ id: z.string().min(1) })

export async function createSetlistAction(
  _state: SetlistActionState,
  formData: FormData,
): Promise<SetlistActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const setlist = await db.setlist.create({
    data: {
      tenantId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      active: parsed.data.active,
    },
  })

  revalidatePath("/admin/repertorio/setlists")
  redirect(`/admin/repertorio/setlists/${setlist.id}`)
}

export async function updateSetlistAction(
  _state: SetlistActionState,
  formData: FormData,
): Promise<SetlistActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const result = await db.setlist.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      active: parsed.data.active,
    },
  })
  if (result.count === 0) return { ok: false, message: "Setlist no encontrada." }

  revalidatePath("/admin/repertorio/setlists")
  revalidatePath(`/admin/repertorio/setlists/${parsed.data.id}`)
  return { ok: true, message: "Cambios guardados." }
}

export async function deleteSetlistAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.setlist.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/repertorio/setlists")
  redirect("/admin/repertorio/setlists")
}

export async function addSongToSetlistAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const setlistId = String(formData.get("setlistId") || "")
  const songId = String(formData.get("songId") || "")
  if (!setlistId || !songId) return

  // Cross-tenant defense: both setlist and song must belong to current tenant.
  const [setlist, song] = await Promise.all([
    db.setlist.findFirst({ where: { id: setlistId, tenantId }, select: { id: true } }),
    db.song.findFirst({ where: { id: songId, tenantId }, select: { id: true } }),
  ])
  if (!setlist || !song) return

  const maxPosition = await db.setlistSong.aggregate({
    where: { setlistId },
    _max: { position: true },
  })
  const nextPosition = (maxPosition._max.position ?? -1) + 1

  await db.setlistSong.upsert({
    where: { setlistId_songId: { setlistId, songId } },
    create: { tenantId, setlistId, songId, position: nextPosition },
    update: {},
  })

  revalidatePath(`/admin/repertorio/setlists/${setlistId}`)
}

export async function removeSongFromSetlistAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const setlistSongId = String(formData.get("setlistSongId") || "")
  const setlistId = String(formData.get("setlistId") || "")
  if (!setlistSongId || !setlistId) return

  await db.setlistSong.deleteMany({ where: { id: setlistSongId, tenantId } })
  revalidatePath(`/admin/repertorio/setlists/${setlistId}`)
}

export async function moveSongAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const setlistSongId = String(formData.get("setlistSongId") || "")
  const setlistId = String(formData.get("setlistId") || "")
  const direction = String(formData.get("direction") || "") as "up" | "down"
  if (!setlistSongId || !setlistId || (direction !== "up" && direction !== "down")) return

  const current = await db.setlistSong.findFirst({
    where: { id: setlistSongId, tenantId, setlistId },
    select: { id: true, position: true },
  })
  if (!current) return

  const neighbor = await db.setlistSong.findFirst({
    where: {
      tenantId,
      setlistId,
      position: direction === "up" ? { lt: current.position } : { gt: current.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
    select: { id: true, position: true },
  })
  if (!neighbor) return

  // Swap positions using a temporary value to satisfy any future unique constraint.
  await db.$transaction([
    db.setlistSong.update({ where: { id: current.id }, data: { position: -1 } }),
    db.setlistSong.update({ where: { id: neighbor.id }, data: { position: current.position } }),
    db.setlistSong.update({ where: { id: current.id }, data: { position: neighbor.position } }),
  ])

  revalidatePath(`/admin/repertorio/setlists/${setlistId}`)
}
