import Link from "next/link"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import type { CSSProperties } from "react"

export const dynamic = "force-dynamic"

export default async function FirmaLayout({ children }: { children: React.ReactNode }) {
  const tenant = await resolveCurrentTenant()

  const themeStyle = {
    "--primary": tenant.primaryColor,
    "--primary-foreground": "#ffffff",
    "--ring": tenant.primaryColor,
  } as CSSProperties

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", ...themeStyle }}>
      <header
        style={{
          padding: "20px 0",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="page-shell"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
        >
          <Link href="/cotizar" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- per-tenant URL
              <img src={tenant.logoUrl} alt={tenant.name} style={{ maxHeight: 36, width: "auto" }} />
            ) : (
              <strong style={{ fontFamily: "var(--font-heading)", fontSize: 22, letterSpacing: "-0.02em" }}>
                {tenant.name}
              </strong>
            )}
          </Link>
          {tenant.whatsapp ? (
            <a
              href={`https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener"
              className="button secondary"
              style={{ padding: "8px 14px", fontSize: 13, textDecoration: "none" }}
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </header>

      <main className="page-shell" style={{ padding: "48px 0 64px", maxWidth: 760 }}>
        {children}
      </main>

      <footer
        className="page-shell"
        style={{ padding: "32px 0", borderTop: "1px solid var(--border)", textAlign: "center" }}
      >
        <p className="muted" style={{ margin: 0, fontSize: 12 }}>
          © {tenant.name} · Firma electrónica
        </p>
      </footer>
    </div>
  )
}
