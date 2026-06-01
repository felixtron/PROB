"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type BankActionState = { ok: boolean; message?: string }

const bankSchema = z.object({
  bankName: z.string().trim().max(120).optional().or(z.literal("")),
  account: z.string().trim().max(60).optional().or(z.literal("")),
  clabe: z.string().trim().max(60).optional().or(z.literal("")),
  beneficiary: z.string().trim().max(120).optional().or(z.literal("")),
})

export async function updateBankAction(
  _state: BankActionState,
  formData: FormData,
): Promise<BankActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = bankSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, message: "Datos inválidos." }

  const data = parsed.data

  await db.bankSettings.upsert({
    where: { tenantId },
    create: {
      tenantId,
      bankName: data.bankName || null,
      account: data.account || null,
      clabe: data.clabe || null,
      beneficiary: data.beneficiary || null,
    },
    update: {
      bankName: data.bankName || null,
      account: data.account || null,
      clabe: data.clabe || null,
      beneficiary: data.beneficiary || null,
    },
  })

  revalidatePath("/admin/bank")
  return { ok: true, message: "Datos bancarios guardados." }
}
