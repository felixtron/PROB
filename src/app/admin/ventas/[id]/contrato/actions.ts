"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"
import {
  DEFAULT_CONTRACT_TEMPLATE,
  generateContractToken,
  renderContractTemplate,
  type ContractVars,
} from "@/lib/contracts"

export type ContractActionState = { ok: boolean; message?: string }

function formatMoney(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountInCents / 100)
}

function formatDateLabel(d: Date | null) {
  if (!d) return "Por confirmar"
  return d.toISOString().slice(0, 10)
}

export async function issueContractAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const bookingId = String(formData.get("bookingId") || "")
  if (!bookingId) return

  const [tenant, booking] = await Promise.all([
    db.tenant.findUnique({ where: { id: tenantId } }),
    db.bookingRequest.findFirst({
      where: { id: bookingId, tenantId },
      include: { contract: true },
    }),
  ])
  if (!tenant || !booking) return
  if (booking.contract) {
    // Already issued — go straight to the existing contract page.
    redirect(`/admin/ventas/${booking.id}/contrato`)
  }

  const balanceCents = Math.max(0, booking.baseAmount - booking.depositAmount)
  const vars: ContractVars = {
    tenantLegalName: tenant.legalName?.trim() || tenant.name,
    tenantLegalRfc: tenant.legalRfc?.trim() || "",
    clientName: booking.clientName,
    packageName: booking.packageName ?? "Servicio musical",
    eventDate: formatDateLabel(booking.requestedDate),
    startTime: booking.startTime ?? "—",
    endTime: booking.endTime ?? "—",
    address: booking.address ?? "—",
    city: booking.city ?? "",
    state: booking.state ?? "",
    guestCount: booking.guestCount?.toString() ?? "—",
    baseAmount: formatMoney(booking.baseAmount, tenant.currency),
    depositAmount: formatMoney(booking.depositAmount, tenant.currency),
    balanceAmount: formatMoney(balanceCents, tenant.currency),
    signedDateLabel: formatDateLabel(new Date()),
  }

  const template = tenant.contractLegalText?.trim() || DEFAULT_CONTRACT_TEMPLATE
  const snapshot = renderContractTemplate(template, vars)

  await db.contract.create({
    data: {
      tenantId,
      bookingRequestId: booking.id,
      shortToken: generateContractToken(),
      legalSnapshot: snapshot,
      status: "draft",
    },
  })

  revalidatePath(`/admin/ventas/${booking.id}`)
  redirect(`/admin/ventas/${booking.id}/contrato`)
}

const signAdminSchema = z.object({
  contractId: z.string().min(1),
  bookingId: z.string().min(1),
  signerName: z.string().trim().min(2, "Nombre del firmante requerido"),
})

export async function signAdminAction(
  _state: ContractActionState,
  formData: FormData,
): Promise<ContractActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = signAdminSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }
  const data = parsed.data

  const contract = await db.contract.findFirst({
    where: { id: data.contractId, tenantId, bookingRequestId: data.bookingId },
  })
  if (!contract) return { ok: false, message: "Contrato no encontrado." }
  if (contract.status === "void") return { ok: false, message: "El contrato está anulado." }
  if (contract.adminSignedAt) return { ok: false, message: "Ya está firmado por el prestador." }

  // New status: signed_admin if no client sig yet, else signed_both.
  const nextStatus = contract.clientSignedAt ? "signed_both" : "signed_admin"

  await db.contract.update({
    where: { id: contract.id },
    data: {
      adminSignerName: data.signerName,
      adminSignedAt: new Date(),
      status: nextStatus,
    },
  })

  revalidatePath(`/admin/ventas/${data.bookingId}/contrato`)
  revalidatePath(`/admin/ventas/${data.bookingId}`)
  return { ok: true, message: "Firmado por el prestador." }
}

export async function voidContractAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const contractId = String(formData.get("contractId") || "")
  const bookingId = String(formData.get("bookingId") || "")
  if (!contractId || !bookingId) return

  await db.contract.updateMany({
    where: { id: contractId, tenantId, bookingRequestId: bookingId },
    data: { status: "void", voidedAt: new Date() },
  })

  revalidatePath(`/admin/ventas/${bookingId}/contrato`)
  revalidatePath(`/admin/ventas/${bookingId}`)
}
