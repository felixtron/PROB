"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type RehearsalActionState = { ok: boolean; message?: string }

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalUrl = z.string().trim().url("URL inválida").or(z.literal("")).optional()

const baseSchema = z.object({
  title: z.string().trim().min(2, "Título requerido").max(120),
  date: z.string().min(1, "Fecha requerida"),
  startTime: optionalStr,
  endTime: optionalStr,
  locationName: optionalStr,
  address: optionalStr,
  mapsLink: optionalUrl,
  goal: z.string().trim().max(2000).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.union([z.literal("scheduled"), z.literal("done"), z.literal("cancelled")]).default("scheduled"),
})

const updateSchema = baseSchema.extend({ id: z.string().min(1) })

function parseDate(raw: string): Date | null {
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function createRehearsalAction(
  _state: RehearsalActionState,
  formData: FormData,
): Promise<RehearsalActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const date = parseDate(parsed.data.date)
  if (!date) return { ok: false, message: "Fecha inválida." }

  const rehearsal = await db.rehearsal.create({
    data: {
      tenantId,
      title: parsed.data.title,
      date,
      startTime: parsed.data.startTime || null,
      endTime: parsed.data.endTime || null,
      locationName: parsed.data.locationName || null,
      address: parsed.data.address || null,
      mapsLink: parsed.data.mapsLink || null,
      goal: parsed.data.goal || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
    },
  })

  revalidatePath("/admin/ensayos")
  redirect(`/admin/ensayos/${rehearsal.id}`)
}

export async function updateRehearsalAction(
  _state: RehearsalActionState,
  formData: FormData,
): Promise<RehearsalActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const date = parseDate(parsed.data.date)
  if (!date) return { ok: false, message: "Fecha inválida." }

  const result = await db.rehearsal.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      title: parsed.data.title,
      date,
      startTime: parsed.data.startTime || null,
      endTime: parsed.data.endTime || null,
      locationName: parsed.data.locationName || null,
      address: parsed.data.address || null,
      mapsLink: parsed.data.mapsLink || null,
      goal: parsed.data.goal || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
    },
  })
  if (result.count === 0) return { ok: false, message: "Ensayo no encontrado." }

  revalidatePath("/admin/ensayos")
  revalidatePath(`/admin/ensayos/${parsed.data.id}`)
  return { ok: true, message: "Cambios guardados." }
}

export async function deleteRehearsalAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.rehearsal.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/ensayos")
  redirect("/admin/ensayos")
}

export async function inviteMusicianAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const rehearsalId = String(formData.get("rehearsalId") || "")
  const musicianId = String(formData.get("musicianId") || "")
  if (!rehearsalId || !musicianId) return

  const [rehearsal, musician] = await Promise.all([
    db.rehearsal.findFirst({ where: { id: rehearsalId, tenantId }, select: { id: true } }),
    db.musician.findFirst({ where: { id: musicianId, tenantId }, select: { id: true } }),
  ])
  if (!rehearsal || !musician) return

  await db.rehearsalAttendance.upsert({
    where: { rehearsalId_musicianId: { rehearsalId, musicianId } },
    create: { tenantId, rehearsalId, musicianId, status: "invited" },
    update: {},
  })
  revalidatePath(`/admin/ensayos/${rehearsalId}`)
}

export async function setAttendanceStatusAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const attendanceId = String(formData.get("attendanceId") || "")
  const rehearsalId = String(formData.get("rehearsalId") || "")
  const status = String(formData.get("status") || "")
  if (!attendanceId || !rehearsalId) return
  if (!["invited", "confirmed", "declined", "attended"].includes(status)) return

  await db.rehearsalAttendance.updateMany({
    where: { id: attendanceId, tenantId, rehearsalId },
    data: { status },
  })
  revalidatePath(`/admin/ensayos/${rehearsalId}`)
}

export async function removeAttendanceAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const attendanceId = String(formData.get("attendanceId") || "")
  const rehearsalId = String(formData.get("rehearsalId") || "")
  if (!attendanceId || !rehearsalId) return

  await db.rehearsalAttendance.deleteMany({ where: { id: attendanceId, tenantId, rehearsalId } })
  revalidatePath(`/admin/ensayos/${rehearsalId}`)
}
