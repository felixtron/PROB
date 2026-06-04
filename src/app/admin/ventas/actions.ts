"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"
import { createDepositCheckoutSession } from "@/lib/checkout"

export type BookingActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string[]>
}

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalEmail = z.string().trim().email("Email inválido").or(z.literal("")).optional()

const createBookingSchema = z.object({
  clientName: z.string().trim().min(2, "Nombre del cliente requerido"),
  clientEmail: optionalEmail,
  clientPhone: optionalStr,
  clientWhatsapp: optionalStr,
  clientId: optionalStr, // optional FK to existing ClientProfile
  packageId: optionalStr, // optional FK to existing ServicePackage
  packageName: optionalStr,
  guestCount: z.coerce.number().int().min(0).optional().or(z.literal("")),
  venueType: optionalStr,
  address: optionalStr,
  city: optionalStr,
  state: optionalStr,
  mapsLink: optionalStr,
  requestedDate: optionalStr, // YYYY-MM-DD from <input type="date">
  startTime: optionalStr,
  endTime: optionalStr,
  baseAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  depositAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  paymentMethod: optionalStr,
  adminNote: z.string().trim().max(2000).optional().or(z.literal("")),
})

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "confirmed", "cancelled", "expired"]),
})

const SHORT_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateShortCode(): string {
  let s = ""
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < 8; i++) s += SHORT_CODE_ALPHABET[bytes[i] % SHORT_CODE_ALPHABET.length]
  return s
}

async function uniqueShortCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const candidate = generateShortCode()
    const exists = await db.bookingRequest.findUnique({ where: { shortCode: candidate } })
    if (!exists) return candidate
  }
  throw new Error("No se pudo generar shortCode único.")
}

export async function createBookingAction(
  _state: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = createBookingSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = parsed.data
  const shortCode = await uniqueShortCode()

  // Resolve package name from FK if not provided
  let packageName = data.packageName || null
  if (data.packageId) {
    const pkg = await db.servicePackage.findFirst({ where: { id: data.packageId, tenantId } })
    if (pkg) packageName = packageName ?? pkg.name
  }

  // Validate client belongs to tenant if provided
  let clientId = data.clientId || null
  if (clientId) {
    const c = await db.clientProfile.findFirst({ where: { id: clientId, tenantId } })
    if (!c) clientId = null
  }

  const requestedDate =
    data.requestedDate && data.requestedDate.length > 0 ? new Date(`${data.requestedDate}T00:00:00`) : null

  const guestCount = typeof data.guestCount === "number" ? data.guestCount : null
  const baseAmount = typeof data.baseAmount === "number" ? Math.round(data.baseAmount * 100) : 0
  const depositAmount = typeof data.depositAmount === "number" ? Math.round(data.depositAmount * 100) : 0

  const booking = await db.bookingRequest.create({
    data: {
      tenantId,
      shortCode,
      clientId,
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      clientPhone: data.clientPhone || null,
      clientWhatsapp: data.clientWhatsapp || null,
      packageId: data.packageId || null,
      packageName,
      guestCount,
      venueType: data.venueType || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      mapsLink: data.mapsLink || null,
      requestedDate,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      baseAmount,
      depositAmount,
      paymentMethod: data.paymentMethod || null,
      adminNote: data.adminNote || null,
      source: "manual",
    },
  })

  revalidatePath("/admin/ventas")
  revalidatePath("/admin")
  redirect(`/admin/ventas?created=${booking.shortCode}`)
}

export async function updateBookingStatusAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return

  await db.bookingRequest.updateMany({
    where: { id: parsed.data.id, tenantId },
    data: { status: parsed.data.status },
  })

  revalidatePath("/admin/ventas")
  revalidatePath("/admin")
}

export async function deleteBookingAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await db.bookingRequest.deleteMany({ where: { id, tenantId } })
  revalidatePath("/admin/ventas")
  revalidatePath("/admin")
}

const updateBookingSchema = z.object({
  id: z.string().min(1),
  clientId: optionalStr,
  clientName: z.string().trim().min(2, "Nombre del cliente requerido"),
  clientEmail: optionalEmail,
  clientPhone: optionalStr,
  clientWhatsapp: optionalStr,
  packageId: optionalStr,
  packageName: optionalStr,
  guestCount: z.coerce.number().int().min(0).optional().or(z.literal("")),
  venueType: optionalStr,
  address: optionalStr,
  city: optionalStr,
  state: optionalStr,
  mapsLink: optionalStr,
  requestedDate: optionalStr,
  startTime: optionalStr,
  endTime: optionalStr,
  baseAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  depositAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  paymentMethod: optionalStr,
  paymentStatus: z.enum(["pending", "completed", "failed"]).optional().or(z.literal("")),
  status: z.enum(["pending", "confirmed", "cancelled", "expired"]),
  adminNote: z.string().trim().max(2000).optional().or(z.literal("")),
})

export async function updateBookingAction(
  _state: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = updateBookingSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = parsed.data

  // Validate FK ownership for client + package
  let clientId: string | null = data.clientId || null
  if (clientId) {
    const c = await db.clientProfile.findFirst({ where: { id: clientId, tenantId } })
    if (!c) clientId = null
  }

  let packageId: string | null = data.packageId || null
  let packageName = data.packageName || null
  if (packageId) {
    const pkg = await db.servicePackage.findFirst({ where: { id: packageId, tenantId } })
    if (!pkg) {
      packageId = null
    } else if (!packageName) {
      packageName = pkg.name
    }
  }

  const requestedDate =
    data.requestedDate && data.requestedDate.length > 0 ? new Date(`${data.requestedDate}T00:00:00`) : null
  const guestCount = typeof data.guestCount === "number" ? data.guestCount : null
  const baseAmount = typeof data.baseAmount === "number" ? Math.round(data.baseAmount * 100) : 0
  const depositAmount = typeof data.depositAmount === "number" ? Math.round(data.depositAmount * 100) : 0

  const result = await db.bookingRequest.updateMany({
    where: { id: data.id, tenantId },
    data: {
      clientId,
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      clientPhone: data.clientPhone || null,
      clientWhatsapp: data.clientWhatsapp || null,
      packageId,
      packageName,
      guestCount,
      venueType: data.venueType || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      mapsLink: data.mapsLink || null,
      requestedDate,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      baseAmount,
      depositAmount,
      paymentMethod: data.paymentMethod || null,
      paymentStatus: data.paymentStatus || "pending",
      status: data.status,
      adminNote: data.adminNote || null,
    },
  })

  if (result.count === 0) return { ok: false, message: "Booking no encontrado." }

  revalidatePath(`/admin/ventas/${data.id}`)
  revalidatePath("/admin/ventas")
  revalidatePath("/admin")
  return { ok: true, message: "Cambios guardados." }
}

export type PaymentLinkActionState = {
  ok: boolean
  message?: string
  url?: string
}

export async function generatePaymentLinkAction(
  _state: PaymentLinkActionState,
  formData: FormData,
): Promise<PaymentLinkActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const bookingId = String(formData.get("bookingId") || "")
  if (!bookingId) return { ok: false, message: "Booking ID requerido." }

  // Build the public origin so the success/cancel URLs point at the live
  // tenant host (not localhost or the admin host in managed mode).
  const reqHeaders = await headers()
  const host = reqHeaders.get("x-tenant-host") ?? reqHeaders.get("host") ?? ""
  const isLocal = host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("::1")
  const protocol = isLocal ? "http" : "https"
  const appOrigin = host ? `${protocol}://${host}` : ""

  const result = await createDepositCheckoutSession(tenantId, bookingId, appOrigin)
  if (!result.ok) return { ok: false, message: result.error }
  return { ok: true, url: result.url, message: "Link generado. Cópialo o mándalo por WhatsApp." }
}
