"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type MediaActionState = { ok: boolean; message?: string }

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalUrl = z.string().trim().url("URL inválida").or(z.literal("")).optional()
const requiredUrl = z.string().trim().url("URL del archivo es requerida")

const baseSchema = z.object({
  kind: z.union([
    z.literal("gallery"),
    z.literal("press"),
    z.literal("hero"),
    z.literal("promo"),
  ]).default("gallery"),
  title: optionalStr,
  alt: z.string().trim().min(2, "Texto alternativo requerido (accesibilidad/SEO)").max(200),
  url: requiredUrl,
  thumbnailUrl: optionalUrl,
  caption: z.string().trim().max(500).optional().or(z.literal("")),
  linkUrl: optionalUrl,
  sortOrder: z.coerce.number().int().min(-9999).max(9999).default(0),
  published: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
})

const updateSchema = baseSchema.extend({ id: z.string().min(1) })

export async function createMediaAction(
  _state: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = baseSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  await db.siteMedia.create({
    data: {
      tenantId,
      kind: parsed.data.kind,
      title: parsed.data.title || null,
      alt: parsed.data.alt,
      url: parsed.data.url,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      caption: parsed.data.caption || null,
      linkUrl: parsed.data.linkUrl || null,
      sortOrder: parsed.data.sortOrder,
      published: parsed.data.published,
    },
  })

  revalidatePath("/admin/media")
  revalidatePath("/")
  return { ok: true, message: "Media agregada." }
}

export async function updateMediaAction(
  _state: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const result = await db.siteMedia.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: {
      kind: parsed.data.kind,
      title: parsed.data.title || null,
      alt: parsed.data.alt,
      url: parsed.data.url,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      caption: parsed.data.caption || null,
      linkUrl: parsed.data.linkUrl || null,
      sortOrder: parsed.data.sortOrder,
      published: parsed.data.published,
    },
  })
  if (result.count === 0) return { ok: false, message: "Media no encontrada." }

  revalidatePath("/admin/media")
  revalidatePath("/")
  return { ok: true, message: "Cambios guardados." }
}

export async function togglePublishedAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return

  const current = await db.siteMedia.findFirst({
    where: { id, tenantId },
    select: { published: true },
  })
  if (!current) return

  await db.siteMedia.updateMany({
    where: { id, tenantId },
    data: { published: !current.published },
  })
  revalidatePath("/admin/media")
  revalidatePath("/")
}

export async function deleteMediaAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.siteMedia.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/media")
  revalidatePath("/")
}

export async function moveMediaAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  const direction = String(formData.get("direction") || "") as "up" | "down"
  if (!id || (direction !== "up" && direction !== "down")) return

  const current = await db.siteMedia.findFirst({
    where: { id, tenantId },
    select: { id: true, sortOrder: true, kind: true },
  })
  if (!current) return

  const neighbor = await db.siteMedia.findFirst({
    where: {
      tenantId,
      kind: current.kind,
      sortOrder: direction === "up" ? { lt: current.sortOrder } : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
    select: { id: true, sortOrder: true },
  })
  if (!neighbor) return

  // Swap via a temporary value in case a future UNIQUE constraint on (tenantId, kind, sortOrder) is added.
  await db.$transaction([
    db.siteMedia.update({ where: { id: current.id }, data: { sortOrder: -10000 } }),
    db.siteMedia.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
    db.siteMedia.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
  ])

  revalidatePath("/admin/media")
  revalidatePath("/")
}
