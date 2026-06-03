"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type AdminNavItem = {
  href: string
  label: string
  comingSoon?: boolean
}

type AdminNavGroup = {
  label: string
  items: AdminNavItem[]
}

const GROUPS: AdminNavGroup[] = [
  {
    label: "Gestión",
    items: [
      { href: "/admin", label: "Inicio" },
      { href: "/admin/eventos", label: "Shows / Eventos", comingSoon: true },
      { href: "/admin/ensayos", label: "Agenda de Ensayos", comingSoon: true },
      { href: "/admin/eventualidades", label: "Eventualidades", comingSoon: true },
    ],
  },
  {
    label: "Mensajería",
    items: [
      { href: "/admin/inbox", label: "Bandeja de Entrada" },
      { href: "/admin/notificaciones", label: "Centro de Mensajería" },
      { href: "/admin/messages", label: "Plantillas" },
    ],
  },
  {
    label: "Clientes",
    items: [
      { href: "/admin/clientes", label: "Clientes" },
      { href: "/admin/ventas", label: "Centro de Ventas" },
      { href: "/admin/testimoniales", label: "Testimoniales", comingSoon: true },
    ],
  },
  {
    label: "Producción",
    items: [
      { href: "/admin/musicians", label: "Banda y Suplentes" },
      { href: "/admin/repertorio", label: "Repertorio" },
    ],
  },
  {
    label: "Oferta",
    items: [{ href: "/admin/packages", label: "Catálogo de Paquetes" }],
  },
  {
    label: "Logística",
    items: [{ href: "/admin/proveedores", label: "Proveedores", comingSoon: true }],
  },
  {
    label: "Ajustes",
    items: [
      { href: "/admin/diagnostico", label: "Diagnóstico", comingSoon: true },
      { href: "/admin/users", label: "Administradores" },
      { href: "/admin/branding", label: "Branding" },
      { href: "/admin/bank", label: "Banco" },
      { href: "/admin/integrations", label: "Integraciones" },
      { href: "/admin/configuracion", label: "Configuración unificada", comingSoon: true },
    ],
  },
  {
    label: "Marketing",
    items: [{ href: "/admin/media", label: "Banners y Galería", comingSoon: true }],
  },
  {
    label: "Otros",
    items: [
      { href: "/admin/payments", label: "Pagos" },
      { href: "/admin/security", label: "Seguridad" },
    ],
  },
]

export function AdminNav({ logoUrl, tenantName }: { logoUrl: string | null; tenantName: string }) {
  const pathname = usePathname() || ""

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="admin-nav">
      <div className="admin-nav-header">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- per-tenant URL, no need for next/image optimization
          <img src={logoUrl} alt={tenantName} />
        ) : (
          <strong>{tenantName}</strong>
        )}
      </div>

      <details className="admin-nav-mobile">
        <summary>Menú</summary>
        <ul>
          {GROUPS.flatMap((group) =>
            group.items.map((item) =>
              item.comingSoon ? (
                <li key={item.href}>
                  <span className="admin-nav-item coming-soon">
                    {item.label} <span className="pill">pronto</span>
                  </span>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className={isActive(item.href) ? "active" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ),
            ),
          )}
        </ul>
      </details>

      <div className="admin-nav-desktop" style={{ display: "grid", gap: 18 }}>
        {GROUPS.map((group) => (
          <div key={group.label} className="admin-nav-group">
            <div className="admin-nav-group-label">{group.label}</div>
            {group.items.map((item) =>
              item.comingSoon ? (
                <span key={item.href} className="admin-nav-item coming-soon">
                  {item.label} <span className="pill">pronto</span>
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item${isActive(item.href) ? " active" : ""}`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
