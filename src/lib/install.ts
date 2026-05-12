import { db } from "@/lib/db"

export async function getInstallationState() {
  return db.installationState.findUnique({ where: { id: "singleton" } })
}

export async function isInstalled() {
  const state = await getInstallationState()
  return Boolean(state?.completed)
}

export async function requireInstalled() {
  const installed = await isInstalled()
  if (!installed) return false
  return true
}
