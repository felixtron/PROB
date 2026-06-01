"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export type AdminNavItem = { href: string; label: string }

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/packages", label: "Paquetes" },
  { href: "/admin/branding", label: "Branding" },
  { href: "/admin/messages", label: "Mensajes" },
  { href: "/admin/bank", label: "Banco" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/integrations", label: "Integraciones" },
  { href: "/admin/security", label: "Seguridad" },
]

export function AdminNav({ items = ADMIN_NAV_ITEMS }: { items?: AdminNavItem[] }) {
  const pathname = usePathname() || ""

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="admin-nav">
      <details className="admin-nav-mobile">
        <summary>Menú</summary>
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive(item.href) ? "active" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </details>
      <ul className="admin-nav-list">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={isActive(item.href) ? "active" : undefined}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
