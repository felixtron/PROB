"use server"

import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"
import { getSessionUser } from "@/lib/auth"

export type UsersActionState = { ok: boolean; message?: string }

const roleSchema = z.enum(["TENANT_ADMIN", "STAFF", "MEMBER"])

const inviteSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(10, "Mínimo 10 caracteres"),
  role: roleSchema,
})

export async function inviteUserAction(
  _state: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  try {
    await db.user.create({
      data: {
        tenantId,
        name: parsed.data.name,
        email: parsed.data.email,
        password: await hash(parsed.data.password, 12),
        role: parsed.data.role,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) {
      return { ok: false, message: "Ese email ya está en uso." }
    }
    return { ok: false, message: "No se pudo crear el usuario." }
  }

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  return { ok: true, message: `Usuario ${parsed.data.email} creado.` }
}

export async function deleteUserAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const session = await getSessionUser()
  if (!session) return
  const targetId = String(formData.get("id") || "")
  if (!targetId || targetId === session.id) return // self-delete blocked silently

  await db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id: targetId } })
    if (!target || target.tenantId !== tenantId) return

    if (target.role === "TENANT_ADMIN") {
      const remainingAdmins = await tx.user.count({
        where: { tenantId, role: "TENANT_ADMIN", NOT: { id: targetId } },
      })
      if (remainingAdmins === 0) {
        // would leave tenant without an admin — abort
        throw new Error("LAST_ADMIN")
      }
    }

    await tx.user.delete({ where: { id: targetId } })
  }).catch((error) => {
    if (error instanceof Error && error.message === "LAST_ADMIN") return
    throw error
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
}
