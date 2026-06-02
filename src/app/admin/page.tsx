import Link from "next/link"
import { redirect } from "next/navigation"
import { isInstalled } from "@/lib/install"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"
import { getDashboardMetrics, getUpcomingEvents } from "@/lib/dashboard-metrics"
import { Sparkline } from "@/components/admin/Sparkline"

export const dynamic = "force-dynamic"

function formatMoney(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountInCents / 100)
}

export default async function AdminPage() {
  if (!(await isInstalled())) redirect("/install")

  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  const now = new Date()
  const [metrics, upcoming] = await Promise.all([
    getDashboardMetrics(tenant.id, now),
    getUpcomingEvents(tenant.id, now, 5),
  ])

  const sparklinePoints = metrics.buckets.map((b) => ({ label: b.monthLabel, value: b.total / 100 }))
  const deltaText =
    metrics.deltaPct === null
      ? "—"
      : `${metrics.deltaPct > 0 ? "+" : ""}${metrics.deltaPct}% vs mes prev.`
  const deltaClass =
    metrics.deltaPct === null
      ? "muted"
      : metrics.deltaPct >= 0
        ? "kpi-delta-up"
        : "kpi-delta-down"

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
            Inicio
          </p>
          <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>{tenant.name}</h1>
          <p className="muted" style={{ margin: 0 }}>Panel de control.</p>
        </div>
      </div>

      {/* HERO ROW — 3 KPI grandes */}
      <div className="grid-3">
        <div className="kpi-card">
          <span className="kpi-label">Ingresos del mes</span>
          <span className="kpi-value">{formatMoney(metrics.thisMonthTotal, tenant.currency)}</span>
          <span className={deltaClass}>{deltaText}</span>
        </div>
        <Link href="/admin/ventas?status=pending" className="kpi-card" style={{ textDecoration: "none" }}>
          <span className="kpi-label">Pipeline activo</span>
          <span className="kpi-value">{formatMoney(metrics.pipelineValue, tenant.currency)}</span>
          <span className="muted" style={{ fontSize: 12 }}>{metrics.pipelineCount} {metrics.pipelineCount === 1 ? "lead" : "leads"} pendientes</span>
        </Link>
        <div className="kpi-card">
          <span className="kpi-label">Conversión</span>
          <span className="kpi-value">
            {metrics.conversionPct === null ? "—" : `${metrics.conversionPct}%`}
          </span>
          <span className="muted" style={{ fontSize: 12 }}>
            {metrics.confirmedCount} confirmados / {metrics.totalBookingsCount} totales
          </span>
        </div>
      </div>

      {/* SECONDARY ROW — 3 cards medianas */}
      <div className="grid-3">
        <div className="card" style={{ padding: 18, display: "grid", gap: 6 }}>
          <span className="kpi-label">Próximos eventos</span>
          <span style={{ fontSize: 24, fontWeight: 800 }}>{upcoming.length}</span>
          <span className="muted" style={{ fontSize: 12 }}>en agenda</span>
        </div>
        <div className="card" style={{ padding: 18, display: "grid", gap: 6 }}>
          <span className="kpi-label">Cotizaciones vencidas</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "var(--muted-foreground)" }}>—</span>
          <span className="muted" style={{ fontSize: 12 }}>Cuando habilitemos expiración automática</span>
        </div>
        <Link
          href="/admin/payments"
          className="card"
          style={{ padding: 18, display: "grid", gap: 6, textDecoration: "none" }}
        >
          <span className="kpi-label">Por cobrar</span>
          <span style={{ fontSize: 24, fontWeight: 800 }}>{metrics.pendingPaymentsCount}</span>
          <span className="muted" style={{ fontSize: 12 }}>Ver pagos →</span>
        </Link>
      </div>

      {/* INCOME CHART */}
      <div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Ingresos por mes</h2>
          <span className="muted" style={{ fontSize: 12 }}>últimos 6 meses</span>
        </div>
        {metrics.buckets.every((b) => b.total === 0) ? (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <p className="muted" style={{ margin: 0 }}>
              Sin pagos registrados aún.
              {" "}
              <Link href="/admin/integrations" style={{ textDecoration: "underline" }}>
                Configura Stripe en Integraciones
              </Link>{" "}
              para empezar a registrar cobros.
            </p>
            <div style={{ marginTop: 16 }}>
              <Sparkline points={[]} />
            </div>
          </div>
        ) : (
          <Sparkline points={sparklinePoints} />
        )}
      </div>

      {/* UPCOMING EVENTS */}
      <div className="card" style={{ padding: 20, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Próximos eventos</h2>
          <Link href="/admin/ventas?status=confirmed" className="muted" style={{ fontSize: 12, textDecoration: "none" }}>
            Ver todos →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Sin eventos confirmados en agenda.{" "}
            <Link href="/admin/ventas/manual" style={{ textDecoration: "underline" }}>Crea una cotización</Link>
            {" "}y confírmala para que aparezca aquí.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Paquete</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{e.date.toISOString().slice(0, 10)}</td>
                  <td>{e.clientName}</td>
                  <td>{e.packageName ?? "Custom"}</td>
                  <td>
                    <span className="badge ok">{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Link href="/admin/ventas/manual" className="button">+ Cotización</Link>
        <Link href="/admin/clientes" className="button secondary">+ Cliente</Link>
        <Link href="/admin/packages" className="button secondary">+ Paquete</Link>
        <Link href="/admin/musicians" className="button secondary">+ Músico</Link>
      </div>
    </div>
  )
}
