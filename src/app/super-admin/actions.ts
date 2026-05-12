"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { installSchema } from "@/lib/install-schema"
import { provisionTenant } from "@/lib/tenant-provisioning"

export type CreateTenantActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string[]>
}

export async function createTenantAction(
  _: CreateTenantActionState,
  formData: FormData,
): Promise<CreateTenantActionState> {
  const raw = Object.fromEntries(formData.entries())
  if (!raw.adminPassword) raw.adminPassword = crypto.randomUUID()

  const parsed = installSchema.extend({ templateId: z.string().optional() }).safeParse(raw)

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  let tenantId: string

  try {
    const tenant = await provisionTenant(parsed.data)
    tenantId = tenant.id
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo crear el tenant.",
    }
  }

  revalidatePath("/super-admin")
  redirect(`/super-admin/tenants/${tenantId}`)
}
