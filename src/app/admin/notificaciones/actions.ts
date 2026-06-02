"use server"

import { revalidatePath } from "next/cache"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"
import { retryNotification } from "@/lib/notifications"

export async function retryNotificationAction(formData: FormData) {
  const tenantId = await resolveTenantIdForAdminAction()
  const id = String(formData.get("id") || "")
  if (!id) return
  await retryNotification(id, tenantId)
  revalidatePath("/admin/notificaciones")
}
