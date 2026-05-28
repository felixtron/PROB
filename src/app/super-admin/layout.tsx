import Link from "next/link"
import { getSessionUser } from "@/lib/auth"
import { LogoutButton } from "@/components/auth/LogoutButton"

export const dynamic = "force-dynamic"

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()

  return (
    <>
      {user ? (
        <header
          className="page-shell"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", gap: 16 }}
        >
          <Link href="/super-admin" style={{ textDecoration: "none", fontWeight: 800 }}>
            PROB Platform
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="muted">{user.email}</span>
            <LogoutButton />
          </div>
        </header>
      ) : null}
      {children}
    </>
  )
}
