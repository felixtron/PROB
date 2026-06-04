import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * When a booking's contract reaches signed_both, this helper:
 *   - creates an Event linked to the booking (if not already created)
 *   - creates a published BandEvent so the date appears on the public landing
 *   - links bookingRequest.eventId → the new Event
 *   - revalidates landing + admin paths
 *
 * Idempotent: re-running on a booking that already has an Event leaves
 * everything unchanged. Safe to call from multiple triggers (admin sign,
 * client sign, stripe webhook, manual confirm).
 *
 * Cross-tenant defense: the booking is read with `where: { id, tenantId }`,
 * so a caller forging a different bookingId can't write into another
 * tenant's data.
 */
export async function applyConfirmationAutomation(
  tenantId: string,
  bookingId: string,
): Promise<{ created: boolean; reason?: string; eventId?: string; bandEventId?: string }> {
  const booking = await db.bookingRequest.findFirst({
    where: { id: bookingId, tenantId },
    include: { contract: true, client: true },
  })
  if (!booking) return { created: false, reason: "booking-not-found" }

  // Only auto-create when both parties signed the contract.
  if (!booking.contract || booking.contract.status !== "signed_both") {
    return { created: false, reason: "contract-not-signed-both" }
  }

  // Need a real event date to create the Event record.
  if (!booking.requestedDate) {
    return { created: false, reason: "no-event-date" }
  }

  // Idempotent: if booking already has an event, nothing to do.
  if (booking.eventId) {
    return { created: false, reason: "already-linked", eventId: booking.eventId }
  }

  const balance = Math.max(0, booking.baseAmount - booking.depositAmount)

  const event = await db.event.create({
    data: {
      tenantId,
      clientId: booking.clientId,
      packageId: booking.packageId,
      packageName: booking.packageName,
      date: booking.requestedDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      amount: booking.baseAmount,
      deposit: booking.depositAmount,
      balance,
      paymentMethod: booking.paymentMethod,
      depositMethod: booking.paymentMethod,
      status: "confirmed",
      notes: booking.adminNote,
    },
  })

  // Link the booking to the new event.
  await db.bookingRequest.update({
    where: { id: booking.id },
    data: { eventId: event.id },
  })

  // Public landing entry — privacy-respecting (no client name in public title).
  const kind = inferBandEventKind(booking.venueType)
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { country: true },
  })

  const bandEvent = await db.bandEvent.create({
    data: {
      tenantId,
      title: privateEventTitle(booking.packageName, booking.venueType),
      kind,
      date: booking.requestedDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      city: booking.city,
      country: tenant?.country ?? null,
      published: true,
      status: "scheduled",
      // No publicNotes — keep client details private. Prisca can edit
      // from /admin/eventualidades if she wants to add public detail.
      internalNotes: `Auto-creado desde booking ${booking.shortCode}`,
    },
  })

  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/eventos")
  revalidatePath("/admin/eventualidades")
  revalidatePath(`/admin/ventas/${booking.id}`)

  return { created: true, eventId: event.id, bandEventId: bandEvent.id }
}

function inferBandEventKind(venueType: string | null): string {
  if (!venueType) return "show"
  const v = venueType.toLowerCase()
  if (v.includes("boda")) return "show"
  if (v.includes("festival")) return "festival"
  if (v.includes("grabacion") || v.includes("grabación")) return "grabacion"
  if (v.includes("residenc")) return "residencia"
  return "show"
}

function privateEventTitle(packageName: string | null, venueType: string | null): string {
  const venue = venueType?.trim()
  if (venue && venue.length > 0) {
    // Capitalize first letter
    return venue.charAt(0).toUpperCase() + venue.slice(1)
  }
  if (packageName) return packageName
  return "Evento privado"
}
