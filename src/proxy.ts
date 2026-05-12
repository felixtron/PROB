import { NextResponse, type NextRequest } from "next/server"
import { extractPlatformSlug, getPlatformHostname, normalizeHostname } from "@/lib/tenant-routing"

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

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
