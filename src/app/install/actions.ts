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
  // Fast-path guards: bounce to the right destination before doing work.
  // The atomic transaction below still re-checks under a row lock to close
  // the race window between guard and provision.
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

  try {
    // Atomic transaction: check -> provision -> mark installed
    const _result = await db.$transaction(async (tx) => {
      // 1. Check if already installed (within transaction, so this is atomic)
      const state = await tx.installationState.findUnique({
        where: { id: "singleton" },
      })

      if (state?.completed) {
        throw new Error("Installation already completed")
      }

      // 2. Provision the tenant (within the same transaction)
      const tenant = await provisionTenant(parsed.data, tx)

      // 3. Mark installation as complete (within the same transaction)
      await tx.installationState.upsert({
        where: { id: "singleton" },
        update: {
          tenantId: tenant.id,
          completed: true,
          completedAt: new Date(),
        },
        create: {
          id: "singleton",
          tenantId: tenant.id,
          completed: true,
          completedAt: new Date(),
        },
      })

      return { tenant }
    })

    redirect("/admin")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Installation failed"
    return {
      ok: false,
      message,
    }
  }
}
