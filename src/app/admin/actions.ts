"use server"

import { revalidatePath } from "next/cache"

export async function revalidateDashboardAction() {
  revalidatePath("/admin")
}
