"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { createDepositCheckoutSession } from "@/lib/checkout"

export async function startDepositCheckoutAction(formData: FormData) {
  const shortCode = String(formData.get("shortCode") || "").toUpperCase()
  if (!shortCode) return

  const tenant = await resolveCurrentTenant()
  const booking = await db.bookingRequest.findFirst({
    where: { shortCode, tenantId: tenant.id },
    select: { id: true },
  })
  if (!booking) return

  const reqHeaders = await headers()
  const host = reqHeaders.get("x-tenant-host") ?? reqHeaders.get("host") ?? ""
  const isLocal = host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("::1")
  const protocol = isLocal ? "http" : "https"
  const appOrigin = host ? `${protocol}://${host}` : ""

  const result = await createDepositCheckoutSession(tenant.id, booking.id, appOrigin)
  if (!result.ok) {
    // Redirect back with the error message in the query string so the page can render it.
    redirect(`/cotizar/exito/${shortCode}?error=${encodeURIComponent(result.error)}`)
  }

  redirect(result.url)
}
