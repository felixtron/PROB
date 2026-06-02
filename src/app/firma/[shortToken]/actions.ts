"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"

export type SignState = { ok: boolean; message?: string }

const signSchema = z.object({
  shortToken: z.string().trim().min(8),
  signerName: z.string().trim().min(2, "Escribe tu nombre completo"),
  signatureDataUrl: z
    .string()
    .trim()
    .min(64, "Falta la firma")
    .startsWith("data:image/", "Firma inválida"),
})

export async function recordClientSignatureAction(
  _state: SignState,
  formData: FormData,
): Promise<SignState> {
  const tenant = await resolveCurrentTenant()
  const parsed = signSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }
  const data = parsed.data

  // Reject overly large data URLs — typical PNG signature is 5-30 KB.
  // Cap to ~600 KB to defend against payload abuse.
  if (data.signatureDataUrl.length > 600_000) {
    return { ok: false, message: "La firma es demasiado grande. Intenta de nuevo." }
  }

  const contract = await db.contract.findFirst({
    where: { shortToken: data.shortToken, tenantId: tenant.id },
  })
  if (!contract) {
    return { ok: false, message: "Contrato no encontrado." }
  }
  if (contract.status === "void") {
    return { ok: false, message: "Este contrato fue anulado." }
  }
  if (contract.clientSignedAt) {
    // Already signed — redirect to success so the link is still useful.
    redirect(`/firma/${data.shortToken}/exito`)
  }

  const nextStatus = contract.adminSignedAt ? "signed_both" : "signed_client"

  await db.contract.update({
    where: { id: contract.id },
    data: {
      clientSignerName: data.signerName,
      clientSignatureDataUrl: data.signatureDataUrl,
      clientSignedAt: new Date(),
      status: nextStatus,
    },
  })

  redirect(`/firma/${data.shortToken}/exito`)
}
