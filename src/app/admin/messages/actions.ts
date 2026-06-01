"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"
import { renderTemplate } from "@/lib/message-templates"
import { sendWhatsApp } from "@/lib/evolution"

export type MessageActionState = { ok: boolean; message?: string }

const keyRegex = /^[a-z0-9][a-z0-9-_]*$/i

const createSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Key requerida")
    .max(60)
    .regex(keyRegex, "Solo letras, números, guiones y _"),
  label: z.string().trim().min(2).max(120),
  content: z.string().trim().min(1).max(4000),
})

const updateSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(2).max(120),
  content: z.string().trim().min(1).max(4000),
})

export async function createMessageTemplateAction(
  _state: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  try {
    await db.messageTemplate.create({
      data: {
        tenantId,
        key: parsed.data.key.toLowerCase(),
        label: parsed.data.label,
        content: parsed.data.content,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) {
      return { ok: false, message: "Ya existe una plantilla con esa key." }
    }
    return { ok: false, message: "No se pudo crear la plantilla." }
  }

  revalidatePath("/admin/messages")
  return { ok: true, message: "Plantilla creada." }
}

export async function updateMessageTemplateAction(
  _state: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: "Datos inválidos." }

  const result = await db.messageTemplate.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: { label: parsed.data.label, content: parsed.data.content },
  })
  if (result.count === 0) return { ok: false, message: "Plantilla no encontrada." }

  revalidatePath("/admin/messages")
  return { ok: true, message: "Plantilla actualizada." }
}

export async function deleteMessageTemplateAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.messageTemplate.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/messages")
}

const testSchema = z.object({
  key: z.string().min(1),
  number: z.string().trim().min(8, "Número inválido"),
  varsText: z.string().optional().or(z.literal("")),
})

function parseVarsText(raw: string): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const line of raw.split("\n")) {
    const idx = line.indexOf("=")
    if (idx <= 0) continue
    const k = line.slice(0, idx).trim()
    const v = line.slice(idx + 1).trim()
    if (k) vars[k] = v
  }
  return vars
}

export async function sendTestMessageAction(
  _state: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = testSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }

  const vars = parseVarsText(parsed.data.varsText ?? "")
  const rendered = await renderTemplate(tenantId, parsed.data.key, vars)
  if (rendered === null) return { ok: false, message: "Plantilla no encontrada." }

  const result = await sendWhatsApp(tenantId, parsed.data.number, rendered)
  return result.ok
    ? { ok: true, message: "Mensaje enviado." }
    : { ok: false, message: result.error ?? "Error enviando." }
}
