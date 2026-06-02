"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { checkRateLimit, clientIpFromHeaders } from "@/lib/funnel-rate-limit"

export type FunnelState = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string[]>
}

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalEmail = z.string().trim().email("Email inválido").or(z.literal("")).optional()

const funnelSchema = z.object({
  packageId: z.string().trim().min(1, "Selecciona un paquete"),
  guestCount: z.coerce.number().int().min(1, "Indica cuántos invitados").max(10000),
  venueType: optionalStr,
  address: z.string().trim().min(5, "Dirección requerida").max(300),
  city: z.string().trim().min(2, "Ciudad requerida"),
  state: z.string().trim().min(2, "Estado requerido"),
  mapsLink: optionalStr,
  requestedDate: z.string().trim().min(8, "Fecha requerida"),
  startTime: z.string().trim().min(4, "Hora de inicio requerida"),
  endTime: z.string().trim().min(4, "Hora de fin requerida"),
  clientName: z.string().trim().min(2, "Nombre requerido"),
  clientPhone: z.string().trim().min(7, "Teléfono requerido"),
  clientEmail: optionalEmail,
  clientWhatsapp: optionalStr,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
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

const DEDUP_WINDOW_MS = 5 * 60 * 1000

export async function submitFunnelAction(
  _state: FunnelState,
  formData: FormData,
): Promise<FunnelState> {
  const tenant = await resolveCurrentTenant()
  const reqHeaders = await headers()

  const ip = clientIpFromHeaders(reqHeaders)
  const now = Date.now()
  const rate = checkRateLimit(`funnel:${tenant.id}:${ip}`, now)
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterMs / 60000)
    return {
      ok: false,
      message: `Demasiados envíos. Intenta de nuevo en ~${minutes} minuto${minutes === 1 ? "" : "s"}.`,
    }
  }

  const parsed = funnelSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }
  const data = parsed.data

  // Validate package belongs to this tenant
  const pkg = await db.servicePackage.findFirst({
    where: { id: data.packageId, tenantId: tenant.id, active: true },
  })
  if (!pkg) {
    return { ok: false, message: "El paquete seleccionado ya no está disponible." }
  }

  // Bug fix vs Vendetta: dedup. If the same email or phone submitted a request in
  // the last 5 minutes for the same package, surface a friendly message instead
  // of creating a duplicate row.
  if (data.clientEmail || data.clientPhone) {
    const cutoff = new Date(now - DEDUP_WINDOW_MS)
    const recent = await db.bookingRequest.findFirst({
      where: {
        tenantId: tenant.id,
        packageId: data.packageId,
        createdAt: { gte: cutoff },
        OR: [
          data.clientEmail ? { clientEmail: data.clientEmail } : { id: "__never__" },
          { clientPhone: data.clientPhone },
        ],
      },
      orderBy: { createdAt: "desc" },
    })
    if (recent) {
      redirect(`/cotizar/exito/${recent.shortCode}`)
    }
  }

  const requestedDate = new Date(`${data.requestedDate}T00:00:00`)
  const shortCode = await uniqueShortCode()

  const booking = await db.bookingRequest.create({
    data: {
      tenantId: tenant.id,
      shortCode,
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      clientPhone: data.clientPhone,
      clientWhatsapp: data.clientWhatsapp || data.clientPhone,
      packageId: pkg.id,
      packageName: pkg.name,
      guestCount: data.guestCount,
      venueType: data.venueType || null,
      address: data.address,
      city: data.city,
      state: data.state,
      mapsLink: data.mapsLink || null,
      requestedDate,
      startTime: data.startTime,
      endTime: data.endTime,
      baseAmount: 0, // price TBD — admin reviews and quotes
      depositAmount: 0,
      paymentStatus: "pending",
      status: "pending",
      adminNote: data.notes || null,
      source: "funnel",
    },
  })

  redirect(`/cotizar/exito/${booking.shortCode}`)
}
