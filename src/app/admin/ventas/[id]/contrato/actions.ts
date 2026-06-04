"use server"

import { headers } from "next/headers"
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
import { dispatchNotification } from "@/lib/notifications"
import { applyConfirmationAutomation } from "@/lib/booking-confirmation"

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

  const shortToken = generateContractToken()
  const contract = await db.contract.create({
    data: {
      tenantId,
      bookingRequestId: booking.id,
      shortToken,
      legalSnapshot: snapshot,
      status: "draft",
    },
  })

  // Auto-WhatsApp the client with the signing link if we have a number to send to.
  // Failure does NOT block the admin redirect (it's persisted as a Notification
  // row with status=failed and can be retried from /admin/notificaciones).
  const recipient = booking.clientWhatsapp || booking.clientPhone
  if (recipient && recipient.trim().length >= 8) {
    try {
      const reqHeaders = await headers()
      const host = reqHeaders.get("x-tenant-host") ?? reqHeaders.get("host") ?? ""
      const isLocal = host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("::1")
      const protocol = isLocal ? "http" : "https"
      const signUrl = host ? `${protocol}://${host}/firma/${shortToken}` : `/firma/${shortToken}`

      const lines = [
        `📝 *Contrato listo para firmar — ${tenant.name}*`,
        ``,
        `Hola ${booking.clientName.split(" ")[0]}, tu contrato del ${vars.eventDate} (${vars.packageName}) está listo.`,
        ``,
        `Léelo y fírmalo aquí (1 minuto):`,
        signUrl,
        ``,
        `Tu firma queda con fecha y hora certificadas. Si tienes dudas, responde por este mismo WhatsApp.`,
      ]
      await dispatchNotification({
        tenantId,
        type: "contract_issued",
        recipient,
        message: lines.join("\n"),
        bookingRequestId: booking.id,
      })
    } catch (error) {
      console.warn("[contract] dispatch failed", error)
    }
  }

  void contract // silence unused if we ever stop using it later
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

  // Auto-create Event + BandEvent (landing) when both parties have signed.
  // Idempotent: re-running on a booking already linked to an Event is a no-op.
  if (nextStatus === "signed_both") {
    try {
      await applyConfirmationAutomation(tenantId, data.bookingId)
    } catch (err) {
      // Don't let automation failure break the signature flow.
      console.error("[contract:signAdmin] confirmation automation failed", err)
    }
  }

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
