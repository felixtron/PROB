import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { isInstalled } from "@/lib/install"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"

export const dynamic = "force-dynamic"

function formatMoney(amountInCents: number, currency: string) {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  })
  return formatter.format(amountInCents / 100)
}

export default async function AdminPage() {
  if (!(await isInstalled())) redirect("/install")

  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  // eslint-disable-next-line react-hooks/purity -- force-dynamic page, computed per-request
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    usersCount,
    activePackages,
    totalPackages,
    paymentsLast30,
    paymentsAggregate,
    integrations,
  ] = await Promise.all([
    db.user.count({ where: { tenantId: tenant.id } }),
    db.servicePackage.count({ where: { tenantId: tenant.id, active: true } }),
    db.servicePackage.count({ where: { tenantId: tenant.id } }),
    db.payment.findMany({
      where: { tenantId: tenant.id, status: "succeeded", paidAt: { gte: thirtyDaysAgo } },
      orderBy: { paidAt: "desc" },
      take: 5,
    }),
    db.payment.aggregate({
      where: { tenantId: tenant.id, status: "succeeded", paidAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.integrationSettings.findUnique({ where: { tenantId: tenant.id } }),
  ])

  const last30Total = paymentsAggregate._sum.amount ?? 0
  const last30Count = paymentsAggregate._count._all

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Inicio
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>{tenant.name}</h1>
        <p className="muted" style={{ margin: 0 }}>
          Administra paquetes, branding, mensajes, cobros y usuarios desde aquí.
        </p>
      </div>

      <div className="grid-3">
        <Link href="/admin/packages" className="card" style={{ padding: 20, textDecoration: "none", display: "grid", gap: 6 }}>
          <strong>Paquetes</strong>
          <p style={{ fontSize: 32, margin: "8px 0 0" }}>{activePackages}</p>
          <span className="muted" style={{ fontSize: 12 }}>
            {totalPackages} totales · {activePackages} activos →
          </span>
        </Link>
        <Link href="/admin/users" className="card" style={{ padding: 20, textDecoration: "none", display: "grid", gap: 6 }}>
          <strong>Usuarios</strong>
          <p style={{ fontSize: 32, margin: "8px 0 0" }}>{usersCount}</p>
          <span className="muted" style={{ fontSize: 12 }}>Administrar equipo →</span>
        </Link>
        <Link href="/admin/payments" className="card" style={{ padding: 20, textDecoration: "none", display: "grid", gap: 6 }}>
          <strong>Cobros (30d)</strong>
          <p style={{ fontSize: 28, margin: "8px 0 0" }}>{formatMoney(last30Total, tenant.currency)}</p>
          <span className="muted" style={{ fontSize: 12 }}>{last30Count} pagos exitosos →</span>
        </Link>
      </div>

      <div className="grid-2">
        <Link
          href="/admin/integrations"
          className="card"
          style={{ padding: 20, textDecoration: "none", display: "grid", gap: 6 }}
        >
          <strong>Integraciones</strong>
          <p className="muted" style={{ margin: 0 }}>
            Stripe: {integrations?.stripeEnabled ? "activo" : "pendiente"}
            <br />
            Evolution: {integrations?.evolutionEnabled ? "activo" : "pendiente"}
          </p>
          <span className="muted" style={{ fontSize: 12 }}>Configurar llaves →</span>
        </Link>
        <Link
          href="/admin/branding"
          className="card"
          style={{ padding: 20, textDecoration: "none", display: "grid", gap: 6 }}
        >
          <strong>Branding</strong>
          <p className="muted" style={{ margin: 0 }}>
            Nombre, colores, descripciones, redes y datos de contacto del proyecto.
          </p>
          <span className="muted" style={{ fontSize: 12 }}>Editar perfil →</span>
        </Link>
      </div>

      {paymentsLast30.length > 0 ? (
        <div className="card" style={{ padding: 20, display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Últimos cobros</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th style={{ textAlign: "right" }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLast30.map((p) => (
                <tr key={p.id}>
                  <td>{(p.paidAt ?? p.createdAt).toISOString().slice(0, 10)}</td>
                  <td>{p.customerName || p.customerEmail || p.description || "—"}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(p.amount, p.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/admin/payments" className="muted" style={{ fontSize: 13, textDecoration: "none" }}>
            Ver historial completo →
          </Link>
        </div>
      ) : null}
    </div>
  )
}
