"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type BandEventActionState = { ok: boolean; message?: string }

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalUrl = z.string().trim().url("URL inválida").or(z.literal("")).optional()
const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => {
    if (!v) return null
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d
  })

const baseSchema = z.object({
  title: z.string().trim().min(2, "Título requerido").max(160),
  kind: z.union([
    z.literal("show"),
    z.literal("residencia"),
    z.literal("festival"),
    z.literal("gira"),
    z.literal("grabacion"),
    z.literal("otro"),
  ]).default("show"),
  date: z.string().min(1, "Fecha requerida"),
  endDate: optionalDate,
  startTime: optionalStr,
  endTime: optionalStr,
  venueName: optionalStr,
  city: optionalStr,
  country: optionalStr,
  ticketUrl: optionalUrl,
  publicNotes: z.string().trim().max(2000).optional().or(z.literal("")),
  internalNotes: z.string().trim().max(2000).optional().or(z.literal("")),
  published: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
  status: z.union([z.literal("scheduled"), z.literal("done"), z.literal("cancelled")]).default("scheduled"),
})

const updateSchema = baseSchema.extend({ id: z.string().min(1) })

function parseDate(raw: string): Date | null {
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function createBandEventAction(
  _state: BandEventActionState,
  formData: FormData,
): Promise<BandEventActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const date = parseDate(parsed.data.date)
  if (!date) return { ok: false, message: "Fecha inválida." }

  await db.bandEvent.create({
    data: {
      tenantId,
      title: parsed.data.title,
      kind: parsed.data.kind,
      date,
      endDate: parsed.data.endDate,
      startTime: parsed.data.startTime || null,
      endTime: parsed.data.endTime || null,
      venueName: parsed.data.venueName || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      ticketUrl: parsed.data.ticketUrl || null,
      publicNotes: parsed.data.publicNotes || null,
      internalNotes: parsed.data.internalNotes || null,
      published: parsed.data.published,
      status: parsed.data.status,
    },
  })

  revalidatePath("/admin/eventualidades")
  return { ok: true, message: "Eventualidad agregada." }
}

export async function updateBandEventAction(
  _state: BandEventActionState,
  formData: FormData,
): Promise<BandEventActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const date = parseDate(parsed.data.date)
  if (!date) return { ok: false, message: "Fecha inválida." }

  const result = await db.bandEvent.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      title: parsed.data.title,
      kind: parsed.data.kind,
      date,
      endDate: parsed.data.endDate,
      startTime: parsed.data.startTime || null,
      endTime: parsed.data.endTime || null,
      venueName: parsed.data.venueName || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      ticketUrl: parsed.data.ticketUrl || null,
      publicNotes: parsed.data.publicNotes || null,
      internalNotes: parsed.data.internalNotes || null,
      published: parsed.data.published,
      status: parsed.data.status,
    },
  })
  if (result.count === 0) return { ok: false, message: "Eventualidad no encontrada." }

  revalidatePath("/admin/eventualidades")
  return { ok: true, message: "Cambios guardados." }
}

export async function togglePublishedAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return

  const current = await db.bandEvent.findFirst({
    where: { id, tenantId },
    select: { published: true },
  })
  if (!current) return

  await db.bandEvent.updateMany({
    where: { id, tenantId },
    data: { published: !current.published },
  })
  revalidatePath("/admin/eventualidades")
}

export async function deleteBandEventAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.bandEvent.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/eventualidades")
}
