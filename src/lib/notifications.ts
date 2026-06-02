import { db } from "@/lib/db"
import { sendWhatsApp } from "@/lib/evolution"

export type DispatchOptions = {
  tenantId: string
  type: string // "funnel_received" | "manual" | "confirm" | ...
  recipient: string
  message: string
  templateKey?: string
  bookingRequestId?: string
  channel?: "whatsapp"
}

export type DispatchResult = { id: string; status: "sent" | "failed" }

export async function dispatchNotification(opts: DispatchOptions): Promise<DispatchResult> {
  // Persist row first so we never lose a delivery attempt to a transient DB hiccup.
  const row = await db.notification.create({
    data: {
      tenantId: opts.tenantId,
      type: opts.type,
      channel: opts.channel ?? "whatsapp",
      recipient: opts.recipient,
      templateKey: opts.templateKey ?? null,
      message: opts.message,
      bookingRequestId: opts.bookingRequestId ?? null,
      status: "pending",
    },
  })

  try {
    const result = await sendWhatsApp(opts.tenantId, opts.recipient, opts.message)
    if (result.ok) {
      await db.notification.update({
        where: { id: row.id },
        data: { status: "sent", sentAt: new Date(), errorDetails: null },
      })
      return { id: row.id, status: "sent" }
    }
    await db.notification.update({
      where: { id: row.id },
      data: { status: "failed", errorDetails: result.error ?? "send returned ok=false" },
    })
    return { id: row.id, status: "failed" }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown error"
    await db.notification.update({
      where: { id: row.id },
      data: { status: "failed", errorDetails: msg },
    })
    return { id: row.id, status: "failed" }
  }
}

export async function retryNotification(notificationId: string, tenantId: string): Promise<DispatchResult | null> {
  const notification = await db.notification.findFirst({
    where: { id: notificationId, tenantId },
  })
  if (!notification) return null

  try {
    const result = await sendWhatsApp(notification.tenantId, notification.recipient, notification.message)
    if (result.ok) {
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          errorDetails: null,
          retries: { increment: 1 },
          lastRetryAt: new Date(),
        },
      })
      return { id: notification.id, status: "sent" }
    }
    await db.notification.update({
      where: { id: notification.id },
      data: {
        status: "failed",
        errorDetails: result.error ?? "send returned ok=false",
        retries: { increment: 1 },
        lastRetryAt: new Date(),
      },
    })
    return { id: notification.id, status: "failed" }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown error"
    await db.notification.update({
      where: { id: notification.id },
      data: {
        status: "failed",
        errorDetails: msg,
        retries: { increment: 1 },
        lastRetryAt: new Date(),
      },
    })
    return { id: notification.id, status: "failed" }
  }
}
