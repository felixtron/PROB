"use server"

import { revalidatePath } from "next/cache"
import { getAdminTheme, setAdminTheme } from "@/lib/admin-theme"

export async function toggleAdminThemeAction() {
  // No requireTenantAdmin here — anyone hitting the admin layout has already
  // passed the auth guard, and this only toggles their own UI preference cookie.
  // It does nothing to data.
  const current = await getAdminTheme()
  await setAdminTheme(current === "dark" ? "light" : "dark")
  revalidatePath("/admin")
}
