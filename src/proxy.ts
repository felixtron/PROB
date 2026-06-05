import { NextResponse, type NextRequest } from "next/server"
import { extractPlatformSlug, getPlatformHostname, normalizeHostname } from "@/lib/tenant-routing"

/**
 * In-memory rate limit map. Per-instance — so behind N replicas the real
 * limit is `maxRequests × N` per window. Acceptable for the one-shot
 * /install endpoint; for sustained-traffic endpoints move this to Redis.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count += 1
  return true
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // === CSRF + rate limit for /install POST (one-time tenant setup) ===
  if (pathname === "/install" && req.method === "POST") {
    const origin = req.headers.get("origin")
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (origin && appUrl) {
      try {
        const allowedHost = new URL(appUrl).host
        const requestHost = new URL(origin).host
        if (requestHost !== allowedHost) {
          return NextResponse.json(
            { error: "CSRF validation failed: invalid origin" },
            { status: 403 },
          )
        }
      } catch {
        return NextResponse.json(
          { error: "CSRF validation failed: invalid request" },
          { status: 403 },
        )
      }
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown"

    if (!checkRateLimit(`install:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many installation requests. Try again in 1 minute." },
        { status: 429, headers: { "Retry-After": "60" } },
      )
    }
  }

  // === Static + API short-circuit ===
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  // === Multi-tenant routing: inject host + platform slug headers ===
  const headers = new Headers(req.headers)
  const hostname = normalizeHostname(req.headers.get("host"))

  if (hostname) {
    headers.set("x-tenant-host", hostname)

    const slug = extractPlatformSlug(hostname, getPlatformHostname())
    if (slug) headers.set("x-tenant-slug", slug)
  }

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
