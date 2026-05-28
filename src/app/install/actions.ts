"use server"

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { isInstalled } from "@/lib/install"
import { isManaged } from "@/lib/platform-mode"
import { installSchema } from "@/lib/install-schema"
import { provisionTenant } from "@/lib/tenant-provisioning"

export type InstallActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string[]>
}

export async function runInstallAction(_: InstallActionState, formData: FormData): Promise<InstallActionState> {
  if (isManaged()) {
    redirect("/super-admin")
  }
  if (await isInstalled()) {
    redirect("/admin")
  }

  const raw = Object.fromEntries(formData.entries())
  const parsed = installSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const tenant = await provisionTenant(parsed.data)

  await db.$transaction(async (tx) => {
    await tx.installationState.upsert({
      where: { id: "singleton" },
      update: { tenantId: tenant.id, completed: true, completedAt: new Date() },
      create: { id: "singleton", tenantId: tenant.id, completed: true, completedAt: new Date() },
    })
  })

  redirect("/admin")
}
