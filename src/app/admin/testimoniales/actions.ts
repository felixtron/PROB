"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type ReviewActionState = { ok: boolean; message?: string }

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
  clientName: z.string().trim().min(2, "Nombre del cliente requerido").max(120),
  eventTitle: optionalStr,
  eventDate: optionalDate,
  rating: z.coerce.number().int().min(1, "Mínimo 1").max(5, "Máximo 5"),
  quote: z.string().trim().min(5, "El testimonio es muy corto").max(2000),
  avatarUrl: optionalUrl,
  source: z.union([
    z.literal("manual"),
    z.literal("whatsapp"),
    z.literal("google"),
    z.literal("instagram"),
    z.literal("email"),
    z.literal("otro"),
  ]).default("manual"),
  published: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
})

const updateSchema = baseSchema.extend({ id: z.string().min(1) })

export async function createReviewAction(
  _state: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  await db.review.create({
    data: {
      tenantId,
      clientName: parsed.data.clientName,
      eventTitle: parsed.data.eventTitle || null,
      eventDate: parsed.data.eventDate,
      rating: parsed.data.rating,
      quote: parsed.data.quote,
      avatarUrl: parsed.data.avatarUrl || null,
      source: parsed.data.source,
      published: parsed.data.published,
    },
  })

  revalidatePath("/admin/testimoniales")
  return { ok: true, message: "Testimonio agregado." }
}

export async function updateReviewAction(
  _state: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const result = await db.review.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      clientName: parsed.data.clientName,
      eventTitle: parsed.data.eventTitle || null,
      eventDate: parsed.data.eventDate,
      rating: parsed.data.rating,
      quote: parsed.data.quote,
      avatarUrl: parsed.data.avatarUrl || null,
      source: parsed.data.source,
      published: parsed.data.published,
    },
  })
  if (result.count === 0) return { ok: false, message: "Testimonio no encontrado." }

  revalidatePath("/admin/testimoniales")
  return { ok: true, message: "Cambios guardados." }
}

export async function togglePublishedAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return

  const current = await db.review.findFirst({
    where: { id, tenantId },
    select: { published: true },
  })
  if (!current) return

  await db.review.updateMany({
    where: { id, tenantId },
    data: { published: !current.published },
  })
  revalidatePath("/admin/testimoniales")
}

export async function deleteReviewAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.review.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/testimoniales")
}
