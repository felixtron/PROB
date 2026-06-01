"use server"

import { cookies } from "next/headers"
import { compare, hash } from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/auth"

export type SecurityActionState = { ok: boolean; message?: string }

const SESSION_COOKIE = "prob_session"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Contraseña actual requerida"),
    newPassword: z.string().min(10, "Mínimo 10 caracteres"),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  })

export async function changeMyPasswordAction(
  _state: SecurityActionState,
  formData: FormData,
): Promise<SecurityActionState> {
  const user = await getSessionUser()
  if (!user) return { ok: false, message: "No hay sesión activa." }

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  const matches = await compare(parsed.data.currentPassword, user.password)
  if (!matches) return { ok: false, message: "La contraseña actual es incorrecta." }

  const newHash = await hash(parsed.data.newPassword, 12)

  const cookieStore = await cookies()
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value

  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { password: newHash } }),
    // Kill every other session of this user (force re-login elsewhere).
    db.session.deleteMany({
      where: { userId: user.id, NOT: currentToken ? { token: currentToken } : undefined },
    }),
  ])

  return { ok: true, message: "Contraseña actualizada. Otras sesiones quedaron cerradas." }
}
