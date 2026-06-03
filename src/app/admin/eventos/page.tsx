import Link from "next/link"
import { ArrowRight, Calendar, MapPin, Clock, DollarSign } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

function formatMoney(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100)
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  confirmed: "Confirmado",
  in_progress: "En curso",
  done: "Realizado",
  cancelled: "Cancelado",
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "confirmed":
    case "done":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "in_progress":
      return "text-yellow-600 border-yellow-600/40 bg-yellow-600/5"
    case "cancelled":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    default:
      return "text-muted-foreground"
  }
}

function startOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" })
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "short" })
}

export default async function EventosPage() {
  const tenant = await resolveCurrentTenant()
  const today = startOfDay(new Date())

  const [upcoming, recentPast] = await Promise.all([
    db.event.findMany({
      where: { tenantId: tenant.id, date: { gte: today } },
      orderBy: { date: "asc" },
      include: {
        client: true,
        location: true,
        bookingRequest: { select: { id: true, shortCode: true, paymentStatus: true } },
      },
    }),
    db.event.findMany({
      where: { tenantId: tenant.id, date: { lt: today } },
      orderBy: { date: "desc" },
      take: 30,
      include: {
        client: true,
        location: true,
        bookingRequest: { select: { id: true, shortCode: true, paymentStatus: true } },
      },
    }),
  ])

  const totalUpcomingAmount = upcoming.reduce((acc, e) => acc + e.amount, 0)
  const totalUpcomingBalance = upcoming.reduce((acc, e) => acc + (e.balance > 0 ? e.balance : Math.max(0, e.amount - e.deposit)), 0)

  const upcomingByMonth = new Map<string, typeof upcoming>()
  for (const e of upcoming) {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`
    const existing = upcomingByMonth.get(key)
    if (existing) existing.push(e)
    else upcomingByMonth.set(key, [e])
  }

  const kpis = [
    { label: "Próximos", value: upcoming.length, icon: Calendar, accent: "text-primary" },
    { label: "Historial", value: recentPast.length, icon: Clock, accent: "text-muted-foreground" },
    {
      label: "Valor en agenda",
      value: formatMoney(totalUpcomingAmount, tenant.currency),
      icon: DollarSign,
      accent: "text-green-600",
    },
    {
      label: "Por cobrar",
      value: formatMoney(totalUpcomingBalance, tenant.currency),
      icon: DollarSign,
      accent: "text-yellow-600",
    },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Shows / Eventos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Agenda de eventos confirmados. Se crean automáticamente cuando una cotización pasa a confirmada.
          </p>
        </div>
        <Link href="/admin/ventas" className="no-underline">
          <Button variant="outline" className="gap-2 h-10 px-4 text-sm font-bold">
            Centro de Ventas
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="bg-card border-border/40 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Icon className={`w-4 h-4 ${kpi.accent}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{kpi.label}</span>
              </div>
              <div className="text-2xl font-black text-foreground">{kpi.value}</div>
            </Card>
          )
        })}
      </div>

      {upcoming.length === 0 && recentPast.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Aún no hay eventos en agenda. Los eventos se crean desde el{" "}
            <Link href="/admin/ventas" className="underline">Centro de Ventas</Link>{" "}
            cuando una cotización se confirma.
          </p>
        </Card>
      ) : null}

      {upcomingByMonth.size > 0 ? (
        <div className="space-y-6 mb-8">
          {Array.from(upcomingByMonth.entries()).map(([key, items]) => (
            <div key={key} className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground capitalize">
                {monthLabel(items[0].date)} · {items.length}
              </h2>
              {items.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {recentPast.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Historial reciente · últimos {recentPast.length}
          </h2>
          {recentPast.map((e) => (
            <EventCard key={e.id} e={e} />
          ))}
        </div>
      ) : null}
    </div>
  )

  function EventCard({ e }: { e: typeof upcoming[number] }) {
    const href = e.bookingRequest ? `/admin/ventas/${e.bookingRequest.id}` : `/admin/ventas`
    const balance = e.balance > 0 ? e.balance : Math.max(0, e.amount - e.deposit)
    return (
      <Link href={href} className="no-underline block">
        <Card className="bg-white p-4 hover:border-primary/40 transition-colors">
          <div className="flex justify-between items-start gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="font-bold text-foreground flex items-center gap-2 flex-wrap">
                {e.client?.name ?? "Cliente sin asignar"}
                <Badge variant="outline" className={statusBadgeClass(e.status)}>
                  {STATUS_LABELS[e.status] || e.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs mt-1 flex items-center gap-2 flex-wrap">
                <Calendar className="w-3 h-3" />
                {dayLabel(e.date)}
                {e.startTime ? <span>· {e.startTime}{e.endTime ? `–${e.endTime}` : ""}</span> : null}
                {e.location?.name ? (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>{e.location.name}</span>
                  </>
                ) : null}
                {e.packageName ? <span>· {e.packageName}</span> : null}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-foreground text-sm">{formatMoney(e.amount, tenant.currency)}</div>
              {balance > 0 ? (
                <div className="text-muted-foreground text-xs mt-0.5">
                  Saldo {formatMoney(balance, tenant.currency)}
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </Link>
    )
  }
}
