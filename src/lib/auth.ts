import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { compare } from "bcryptjs"
import type { User } from "@prisma/client"
import { db } from "@/lib/db"
import { isStandalone } from "@/lib/platform-mode"

const SESSION_COOKIE = "prob_session"
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

function generateToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

// Cookie writes are only allowed in Server Actions / Route Handlers.
export async function createSession(userId: string) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await db.session.create({ data: { token, userId, expiresAt } })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) await db.session.deleteMany({ where: { token } })
  cookieStore.delete(SESSION_COOKIE)
}

// Read-only w.r.t. cookies — safe in Server Components and layouts.
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await db.session.findUnique({ where: { token }, include: { user: true } })
  if (!session) return null
  if (session.expiresAt.getTime() < Date.now()) return null

  return session.user
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return null
  const ok = await compare(password, user.password)
  return ok ? user : null
}

export async function countSuperAdmins() {
  return db.user.count({ where: { role: "SUPER_ADMIN" } })
}

export async function hasSuperAdmin() {
  return (await countSuperAdmins()) > 0
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  return user
}

export async function requireSuperAdmin(): Promise<User> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  if (user.role !== "SUPER_ADMIN") notFound()
  return user
}

export async function requireTenantAdmin(tenantId?: string): Promise<User> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  if (user.role === "SUPER_ADMIN") return user
  if (user.role !== "TENANT_ADMIN") notFound()
  if (tenantId && user.tenantId !== tenantId) notFound()
  return user
}

// Gates the super-admin console: 404 in standalone, bootstrap if no super admin yet.
export async function requireSuperAdminConsole(): Promise<User> {
  if (isStandalone()) notFound()
  if (!(await hasSuperAdmin())) redirect("/super-admin/setup")
  return requireSuperAdmin()
}
