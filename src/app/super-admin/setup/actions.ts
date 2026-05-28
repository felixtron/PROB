"use server"

import { redirect, notFound } from "next/navigation"
import { hash } from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { createSession } from "@/lib/auth"
import { isStandalone } from "@/lib/platform-mode"

export type SetupActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string[]>
}

const setupSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres"),
})

export async function createFirstSuperAdminAction(
  _: SetupActionState,
  formData: FormData,
): Promise<SetupActionState> {
  if (isStandalone()) notFound()

  const parsed = setupSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  let userId: string

  try {
    const user = await db.$transaction(async (tx) => {
      const existingSuperAdmins = await tx.user.count({ where: { role: "SUPER_ADMIN" } })
      if (existingSuperAdmins > 0) throw new Error("Ya existe un super admin.")

      const existingEmail = await tx.user.findUnique({ where: { email: parsed.data.email } })
      if (existingEmail) throw new Error("Ya existe un usuario con ese email.")

      return tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: await hash(parsed.data.password, 12),
          role: "SUPER_ADMIN",
          tenantId: null,
        },
      })
    })
    userId = user.id
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo crear el super admin.",
    }
  }

  await createSession(userId)
  redirect("/super-admin")
}
