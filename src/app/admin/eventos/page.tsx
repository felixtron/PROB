import Link from "next/link"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"

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

const STATUS_BADGE: Record<string, string> = {
  scheduled: "muted",
  confirmed: "ok",
  in_progress: "warn",
  done: "ok",
  cancelled: "err",
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

  // Group upcoming by month
  const upcomingByMonth = new Map<string, typeof upcoming>()
  for (const e of upcoming) {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`
    const existing = upcomingByMonth.get(key)
    if (existing) existing.push(e)
    else upcomingByMonth.set(key, [e])
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
            Gestión
          </p>
          <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Shows / Eventos</h1>
          <p className="muted" style={{ margin: 0 }}>
            Agenda de eventos confirmados (los que ya pasaron de cotización a contrato).
            Para crear o gestionar uno, ve al Centro de Ventas.
          </p>
        </div>
        <Link href="/admin/ventas" className="button secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
          → Centro de Ventas
        </Link>
      </div>

      {upcoming.length === 0 && recentPast.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>
            Aún no hay eventos en agenda. Los eventos se crean desde el{" "}
            <Link href="/admin/ventas" style={{ textDecoration: "underline" }}>Centro de Ventas</Link>{" "}
            cuando una cotización se confirma.
          </p>
        </div>
      ) : null}

      {upcomingByMonth.size > 0 ? (
        <div style={{ display: "grid", gap: 22 }}>
          {Array.from(upcomingByMonth.entries()).map(([key, items]) => (
            <div key={key} style={{ display: "grid", gap: 10 }}>
              <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                {monthLabel(items[0].date)} · {items.length}
              </p>
              {items.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {recentPast.length > 0 ? (
        <div style={{ display: "grid", gap: 10 }}>
          <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
            Historial reciente · últimos {recentPast.length}
          </p>
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
      <Link
        href={href}
        className="card"
        style={{
          padding: 16,
          display: "grid",
          gap: 8,
          textDecoration: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {e.client?.name ?? "Cliente sin asignar"}
              <span className={`badge ${STATUS_BADGE[e.status] || "muted"}`}>{STATUS_LABELS[e.status] || e.status}</span>
            </div>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              {dayLabel(e.date)}
              {e.startTime ? ` · ${e.startTime}${e.endTime ? `–${e.endTime}` : ""}` : ""}
              {e.location?.name ? ` · ${e.location.name}` : ""}
              {e.packageName ? ` · ${e.packageName}` : ""}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{formatMoney(e.amount, tenant.currency)}</div>
            {balance > 0 ? (
              <div className="muted" style={{ fontSize: 12 }}>
                Saldo {formatMoney(balance, tenant.currency)}
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    )
  }
}
