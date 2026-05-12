import { NextResponse, type NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
