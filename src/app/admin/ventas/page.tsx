import Link from "next/link"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { updateBookingStatusAction, deleteBookingAction } from "@/app/admin/ventas/actions"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  expired: "Expirado",
}

const STATUS_BADGE: Record<string, string> = {
  pending: "badge warn",
  confirmed: "badge ok",
  cancelled: "badge muted",
  expired: "badge err",
}

const FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmados" },
  { value: "cancelled", label: "Cancelados" },
  { value: "expired", label: "Expirados" },
]

function formatMoney(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountInCents / 100)
}

type VentasPageProps = {
  searchParams: Promise<{ status?: string; created?: string }>
}

export default async function VentasPage({ searchParams }: VentasPageProps) {
  const tenant = await resolveCurrentTenant()
  const { status: statusFilter = "all", created } = await searchParams

  const where = statusFilter === "all"
    ? { tenantId: tenant.id }
    : { tenantId: tenant.id, status: statusFilter }

  const [bookings, counts] = await Promise.all([
    db.bookingRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { client: true },
      take: 100,
    }),
    db.bookingRequest.groupBy({
      by: ["status"],
      where: { tenantId: tenant.id },
      _count: { _all: true },
    }),
  ])

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))
  const total = counts.reduce((acc, c) => acc + c._count._all, 0)

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
            Admin
          </p>
          <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Centro de Ventas</h1>
          <p className="muted" style={{ margin: 0 }}>
            Pipeline de cotizaciones y bookings. Crea manuales aquí; los del funnel público llegarán automáticamente cuando habilitemos /cotizar (Fase 3d).
          </p>
        </div>
        <Link href="/admin/ventas/manual" className="button">+ Nueva cotización</Link>
      </div>

      {created ? (
        <div className="card" style={{ padding: 14, borderColor: "rgba(134,239,172,0.5)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#86efac" }}>
            Creado con código <strong>{created}</strong>.
          </p>
        </div>
      ) : null}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTER_OPTIONS.map((opt) => {
          const count = opt.value === "all" ? total : (countByStatus[opt.value] ?? 0)
          const isActive = (statusFilter ?? "all") === opt.value
          const href = opt.value === "all" ? "/admin/ventas" : `/admin/ventas?status=${opt.value}`
          return (
            <Link
              key={opt.value}
              href={href}
              className="card"
              style={{
                padding: "8px 14px",
                textDecoration: "none",
                background: isActive ? "var(--primary)" : "var(--card)",
                color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
                fontWeight: 700,
                fontSize: 13,
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              {opt.label}
              <span style={{ opacity: 0.7, fontSize: 12 }}>{count}</span>
            </Link>
          )
        })}
      </div>

      {bookings.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>
            {statusFilter === "all"
              ? "Aún no hay cotizaciones. Crea la primera con + Nueva cotización."
              : `Sin cotizaciones con status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 4, overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Paquete</th>
                <th>Fecha</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th>Status</th>
                <th>Origen</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link
                      href={`/admin/ventas/${b.id}`}
                      style={{ textDecoration: "none", color: "var(--primary)", fontWeight: 700 }}
                    >
                      <code style={{ fontSize: 12 }}>{b.shortCode}</code>
                    </Link>
                  </td>
                  <td>
                    <strong>{b.clientName}</strong>
                    {b.client ? (
                      <>
                        <br />
                        <span className="muted" style={{ fontSize: 11 }}>{b.client.email ?? b.client.phone ?? ""}</span>
                      </>
                    ) : b.clientEmail || b.clientPhone ? (
                      <>
                        <br />
                        <span className="muted" style={{ fontSize: 11 }}>{b.clientEmail ?? b.clientPhone}</span>
                      </>
                    ) : null}
                  </td>
                  <td>{b.packageName ?? "Custom"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {b.requestedDate ? b.requestedDate.toISOString().slice(0, 10) : "—"}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatMoney(b.baseAmount, tenant.currency)}
                  </td>
                  <td>
                    <span className={STATUS_BADGE[b.status] ?? "badge muted"}>
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </td>
                  <td>
                    <span className="muted" style={{ fontSize: 11 }}>{b.source}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      {b.status === "pending" ? (
                        <form action={updateBookingStatusAction} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value="confirmed" />
                          <button
                            className="button secondary"
                            type="submit"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                          >
                            Confirmar
                          </button>
                        </form>
                      ) : null}
                      {b.status !== "cancelled" ? (
                        <form action={updateBookingStatusAction} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <button
                            className="button secondary"
                            type="submit"
                            style={{ padding: "4px 10px", fontSize: 12, color: "#fb7185", borderColor: "rgba(251,113,133,0.4)" }}
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : null}
                      <form action={deleteBookingAction} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={b.id} />
                        <button
                          className="button secondary"
                          type="submit"
                          style={{ padding: "4px 8px", fontSize: 12, color: "#fb7185", borderColor: "rgba(251,113,133,0.4)" }}
                        >
                          ✕
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
