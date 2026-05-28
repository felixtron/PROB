"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createSession, destroySession, verifyCredentials } from "@/lib/auth"

export type LoginActionState = {
  ok: boolean
  message?: string
}

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
})

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, message: "Revisa el email y la contraseña." }
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password)
  if (!user) {
    return { ok: false, message: "Credenciales inválidas." }
  }

  await createSession(user.id)
  redirect(user.role === "SUPER_ADMIN" ? "/super-admin" : "/admin")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}
