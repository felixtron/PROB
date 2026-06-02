import Link from "next/link"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import type { CSSProperties } from "react"

export const dynamic = "force-dynamic"

export default async function CotizarLayout({ children }: { children: React.ReactNode }) {
  const tenant = await resolveCurrentTenant()

  // Use the tenant's primary color throughout the funnel — overrides --primary
  // for this subtree only. Future tenants get their look automatically.
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
          background: "color-mix(in srgb, var(--background) 70%, transparent)",
          position: "sticky",
          top: 0,
          backdropFilter: "blur(8px)",
          zIndex: 10,
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

      <main className="page-shell" style={{ padding: "48px 0 64px" }}>
        {children}
      </main>

      <footer
        className="page-shell"
        style={{ padding: "32px 0", borderTop: "1px solid var(--border)", textAlign: "center" }}
      >
        <p className="muted" style={{ margin: 0, fontSize: 12 }}>
          © {tenant.name}
          {tenant.website ? (
            <>
              {" · "}
              <a href={tenant.website} target="_blank" rel="noopener" style={{ textDecoration: "underline" }}>
                {tenant.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            </>
          ) : null}
        </p>
      </footer>
    </div>
  )
}
