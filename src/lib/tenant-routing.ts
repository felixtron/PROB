const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"])

export function normalizeHostname(host: string | null) {
  if (!host) return null
  const normalized = host.trim().toLowerCase().replace(/:\d+$/, "")
  return normalized || null
}

export function getPlatformHostname() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!configuredUrl) return null

  try {
    return normalizeHostname(new URL(configuredUrl).host)
  } catch {
    return normalizeHostname(configuredUrl)
  }
}

export function extractPlatformSlug(hostname: string, platformHostname: string | null) {
  if (!platformHostname || LOCAL_HOSTS.has(hostname)) return null
  if (!hostname.endsWith(`.${platformHostname}`)) return null

  const slug = hostname.slice(0, -(platformHostname.length + 1))
  return slug && !slug.includes(".") ? slug : null
}
