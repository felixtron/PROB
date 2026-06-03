import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Calendar, Banknote, FileText, TrendingUp, Music, Bell,
  Plus, FilePlus, CalendarDays, Inbox,
} from "lucide-react"
import { isInstalled } from "@/lib/install"
import { getCurrentTenant, getInstalledTenant } from "@/lib/tenant"
import { isStandalone } from "@/lib/platform-mode"
import { getDashboardMetrics, getUpcomingEvents } from "@/lib/dashboard-metrics"
import { db } from "@/lib/db"
import { formatDateMX } from "@/lib/utils"
import { IncomeChart } from "@/components/admin/IncomeChart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

function makeMoneyFormatter(currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  })
}

export default async function AdminPage() {
  if (!(await isInstalled())) redirect("/install")

  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  const now = new Date()
  const [metrics, upcoming, pendingInbox] = await Promise.all([
    getDashboardMetrics(tenant.id, now),
    getUpcomingEvents(tenant.id, now, 5),
    db.inboxItem.count({ where: { tenantId: tenant.id, status: "pending" } }).catch(() => 0),
  ])

  const fmt = makeMoneyFormatter(tenant.currency)
  const MXN = (v: number) => fmt.format(v / 100)

  // Filter upcoming to ones within 7 days for the alert pill
  const oneWeekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const soonEvents = upcoming.filter((e) => e.date <= oneWeekAhead)

  // Chart-ready data — IncomeChart expects display amounts (not cents)
  const chartData = metrics.buckets.map((b) => ({
    month: b.monthLabel,
    total: b.total / 100,
    count: b.count,
  }))

  const monthDelta = metrics.deltaPct

  const kpis = [
    {
      label: "Ingresos del mes",
      value: MXN(metrics.thisMonthTotal),
      sub:
        monthDelta !== null
          ? `${monthDelta >= 0 ? "↗" : "↘"} ${Math.abs(monthDelta)}% vs mes anterior`
          : "Ingresos consolidados",
      subColor: monthDelta === null ? "text-muted-foreground" : monthDelta >= 0 ? "text-green-600" : "text-red-600",
      icon: Banknote,
    },
    {
      label: "Valor del Pipeline",
      value: MXN(metrics.pipelineValue),
      sub: `${metrics.pipelineCount} lead${metrics.pipelineCount === 1 ? "" : "s"} activo${metrics.pipelineCount === 1 ? "" : "s"}`,
      subColor: "text-primary font-black",
      icon: FileText,
    },
    {
      label: "Tasa de Cierre",
      value: metrics.conversionPct === null ? "—" : `${metrics.conversionPct}%`,
      sub: `${metrics.confirmedCount} confirmados / ${metrics.totalBookingsCount} totales`,
      subColor: "text-muted-foreground",
      icon: TrendingUp,
    },
    {
      label: "Pagos por cobrar",
      value: String(metrics.pendingPaymentsCount),
      sub: metrics.pendingPaymentsCount > 0 ? "Ver pagos →" : "Sin pendientes",
      subColor: "text-muted-foreground",
      icon: Banknote,
    },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard General</h1>
          <p className="text-muted-foreground mt-1 text-sm capitalize">
            {formatDateMX(now, "PPPP")}
          </p>
        </div>
        {soonEvents.length > 0 ? (
          <div className="flex items-center gap-2 bg-primary/15 border border-primary/40 rounded-lg px-4 py-2">
            <Bell className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-bold">
              {soonEvents.length} show{soonEvents.length > 1 ? "s" : ""} esta semana
            </span>
          </div>
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/ventas/manual" className="no-underline">
          <Button variant="outline" className="w-full h-14 justify-start gap-4 border-dashed border-primary/40 hover:border-primary hover:bg-primary/10 rounded-xl group transition-all">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-foreground">Nuevo Evento</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Reservar / Cotizar</div>
            </div>
          </Button>
        </Link>

        <Link href="/admin/ventas" className="no-underline">
          <Button variant="outline" className="w-full h-14 justify-start gap-4 border-dashed border-blue-600/40 hover:border-blue-600 hover:bg-blue-600/10 rounded-xl group transition-all">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <FilePlus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-foreground">Centro de Ventas</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Pipeline / Cotizaciones</div>
            </div>
          </Button>
        </Link>

        <Link href="/admin/ensayos" className="no-underline">
          <Button variant="outline" className="w-full h-14 justify-start gap-4 border-dashed border-border/40 hover:border-primary hover:bg-primary/10 rounded-xl group transition-all">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-foreground">Agendar Ensayo</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Producción</div>
            </div>
          </Button>
        </Link>

        <Link href="/admin/inbox" className="no-underline">
          <Button variant="outline" className="w-full h-14 justify-start gap-4 border-dashed border-border/40 hover:border-primary hover:bg-primary/10 rounded-xl group transition-all relative">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-foreground">Bandeja Inbox</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Atención a Leads</div>
            </div>
            {pendingInbox > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                {pendingInbox}
              </span>
            ) : null}
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground/60" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground tracking-tight">{kpi.value}</div>
                <p className={`text-[11px] mt-1 font-bold ${kpi.subColor}`}>{kpi.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Income chart + Upcoming events — 2 cols on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ingresos por mes</CardTitle>
                <CardDescription>Últimos 6 meses · {tenant.currency}</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {metrics.succeededThisMonthCount} cobro{metrics.succeededThisMonthCount === 1 ? "" : "s"} este mes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.every((d) => d.total === 0) ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Sin pagos registrados aún.{" "}
                  <Link href="/admin/integrations" className="underline text-primary">
                    Configura Stripe en Integraciones
                  </Link>{" "}
                  para empezar.
                </p>
              </div>
            ) : (
              <IncomeChart data={chartData} currency={tenant.currency} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Próximos eventos</CardTitle>
              <Link href="/admin/eventos" className="text-[11px] font-bold text-primary uppercase tracking-tight">
                Ver todos →
              </Link>
            </div>
            <CardDescription>Confirmados en agenda</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin eventos confirmados.{" "}
                <Link href="/admin/ventas/manual" className="underline">Crear cotización</Link>.
              </p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">
                        {e.clientName}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight truncate">
                        {e.packageName ?? "Custom"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-foreground">
                        {formatDateMX(e.date, "d MMM")}
                      </div>
                      <Badge variant="outline" className="text-[9px] mt-0.5">
                        {e.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick navigation cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Banda y Suplentes", href: "/admin/musicians", icon: Music, desc: "Roster del proyecto" },
          { label: "Repertorio", href: "/admin/repertorio", icon: Music, desc: "Catálogo de canciones" },
          { label: "Eventualidades", href: "/admin/eventualidades", icon: Calendar, desc: "Shows propios" },
          { label: "Testimoniales", href: "/admin/testimoniales", icon: FileText, desc: "Reseñas publicadas" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="no-underline">
              <Card className="bg-white hover:border-primary/40 transition-colors h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-tight truncate">{item.desc}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
