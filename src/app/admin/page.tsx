import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Calendar, Banknote, FileText, TrendingUp, Music, Bell,
  Plus, FilePlus, CalendarDays, Inbox, RefreshCcw, Zap,
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
import { revalidateDashboardAction } from "@/app/admin/actions"

export const dynamic = "force-dynamic"

function makeMoneyFormatter(currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  })
}

const SOURCE_LABELS: Record<string, string> = {
  web: "LEAD WEB",
  manual: "MANUAL",
  whatsapp: "WHATSAPP",
  funnel: "LEAD WEB",
}

function digitsOnly(s: string | null | undefined): string {
  return (s ?? "").replace(/[^\d]/g, "")
}

export default async function AdminPage() {
  if (!(await isInstalled())) redirect("/install")

  const tenant = isStandalone()
    ? await getInstalledTenant()
    : (await getCurrentTenant()) ?? (await getInstalledTenant())
  if (!tenant) redirect("/install")

  const now = new Date()
  const [metrics, upcoming, pendingLeads, pendingInbox] = await Promise.all([
    getDashboardMetrics(tenant.id, now),
    getUpcomingEvents(tenant.id, now, 5),
    db.bookingRequest.findMany({
      where: { tenantId: tenant.id, status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        shortCode: true,
        clientName: true,
        clientWhatsapp: true,
        clientPhone: true,
        baseAmount: true,
        source: true,
        createdAt: true,
        packageName: true,
        requestedDate: true,
      },
    }),
    db.inboxItem.count({ where: { tenantId: tenant.id, status: "pending" } }).catch(() => 0),
  ])

  const fmt = makeMoneyFormatter(tenant.currency)
  const MXN = (v: number) => fmt.format(v / 100)

  const oneWeekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const soonEvents = upcoming.filter((e) => e.date <= oneWeekAhead)

  const chartData = metrics.buckets.map((b) => ({
    month: b.monthLabel,
    total: b.total / 100,
    count: b.count,
  }))

  const monthDelta = metrics.deltaPct

  const kpis = [
    {
      label: "Proyección del Mes",
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
      sub: metrics.conversionPct === null ? "Sin datos aún" : "Conversión real",
      subColor: metrics.conversionPct === null ? "text-muted-foreground" : "text-yellow-600 font-black",
      icon: TrendingUp,
    },
    {
      label: "Shows Próximos",
      value: String(upcoming.length),
      sub: upcoming.length > 0 ? "Agenda confirmada" : "Sin agenda",
      subColor: "text-muted-foreground",
      icon: Music,
    },
  ]

  return (
    <div className="p-8 bg-background min-h-full text-foreground">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard General</h1>
          <p className="text-muted-foreground mt-1 text-sm capitalize">
            {formatDateMX(now, "PPPP")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <form action={revalidateDashboardAction}>
            <Button
              type="submit"
              variant="outline"
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="font-bold">Sincronizar Datos</span>
            </Button>
          </form>
          {soonEvents.length > 0 ? (
            <div className="flex items-center gap-2 bg-primary/15 border border-primary/40 rounded-lg px-4 py-2">
              <Bell className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-bold">
                {soonEvents.length} show{soonEvents.length > 1 ? "s" : ""} esta semana
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Primary (solid pink) */}
        <Link href="/admin/ventas/manual" className="no-underline">
          <Button className="w-full h-14 justify-start gap-4 bg-primary hover:brightness-110 text-white rounded-xl group transition-all shadow-lg shadow-primary/30">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">Nuevo Evento</div>
              <div className="text-[10px] text-white/70 uppercase tracking-tight">Manual / Admin</div>
            </div>
          </Button>
        </Link>

        <Link href="/admin/ventas" className="no-underline">
          <Button variant="outline" className="w-full h-14 justify-start gap-4 border-dashed border-blue-600/40 hover:border-blue-600 hover:bg-blue-600/10 rounded-xl group transition-all">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <FilePlus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-foreground">Nueva Cotización</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Venta Directa</div>
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
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black h-5 min-w-5 px-1 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                {pendingInbox > 99 ? "99+" : pendingInbox}
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
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground tracking-tight">{kpi.value}</div>
                <p className={`text-[11px] mt-1 font-black uppercase tracking-tight ${kpi.subColor}`}>{kpi.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Income chart + Pipeline Activo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle className="text-lg">Tendencia de Ingresos</CardTitle>
                <CardDescription>Historial de facturación — últimos 6 meses</CardDescription>
              </div>
              <Link href="/admin/payments" className="no-underline">
                <Badge variant="outline" className="text-[10px] uppercase tracking-tight font-bold text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer">
                  Ver detalle
                </Badge>
              </Link>
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
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg">Pipeline Activo</CardTitle>
                <CardDescription>Cotizaciones y leads sin concretar</CardDescription>
              </div>
              <Link href="/admin/ventas?status=pending" className="no-underline">
                <Badge variant="outline" className="text-[10px] uppercase tracking-tight font-bold text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer">
                  Gestionar
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay leads pendientes.{" "}
                <Link href="/admin/ventas/manual" className="underline">
                  Crear cotización
                </Link>
                .
              </p>
            ) : (
              pendingLeads.map((lead) => {
                const wa = digitsOnly(lead.clientWhatsapp || lead.clientPhone)
                const sourceLabel = SOURCE_LABELS[lead.source] ?? lead.source.toUpperCase()
                const dateLabel = formatDateMX(lead.createdAt, "d MMM").toUpperCase()
                return (
                  <div key={lead.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3 hover:border-primary/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black uppercase tracking-tight text-foreground truncate">
                        {lead.clientName}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                        {sourceLabel} · {dateLabel}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-foreground">{MXN(lead.baseAmount)}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={`/admin/ventas/${lead.id}`}
                        aria-label="Atender lead"
                        className="w-7 h-7 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 flex items-center justify-center text-yellow-600 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </Link>
                      {wa ? (
                        <a
                          href={`https://wa.me/${wa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Mensaje WhatsApp"
                          className="relative w-7 h-7 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-600 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.876.516 3.633 1.41 5.139L2 22l5.025-1.388A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                          </svg>
                          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[9px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center border border-white">
                            1
                          </span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                )
              })
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
