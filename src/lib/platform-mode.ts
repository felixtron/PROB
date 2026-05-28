export type PlatformMode = "managed" | "standalone"

export function getPlatformMode(): PlatformMode {
  return process.env.PLATFORM_MODE === "managed" ? "managed" : "standalone"
}

export function isManaged() {
  return getPlatformMode() === "managed"
}

export function isStandalone() {
  return getPlatformMode() === "standalone"
}
