// Simple in-memory IP rate limiter for the public funnel.
// Same pattern Vendetta uses, with the same caveat: state is per-process,
// so it's reset on container restart and not shared across replicas.
// Acceptable for early traffic; replace with DB- or Redis-backed when we
// run multiple replicas or need durable counters.

const WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_PER_WINDOW = 5 // generous for a single household / coffee shop NAT

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function checkRateLimit(key: string, now: number): { ok: true } | { ok: false; retryAfterMs: number } {
  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true }
  }
  if (bucket.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfterMs: bucket.resetAt - now }
  }
  bucket.count += 1
  return { ok: true }
}

export function clientIpFromHeaders(headers: Headers): string {
  // X-Forwarded-For is set by Traefik for both standalone (Prisca) and managed deploys.
  const xff = headers.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  return headers.get("x-real-ip") ?? "unknown"
}
