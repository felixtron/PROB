import Link from "next/link"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { retryNotificationAction } from "@/app/admin/notificaciones/actions"

export const dynamic = "force-dynamic"

const STATUS_BADGE: Record<string, string> = {
  sent: "badge ok",
  failed: "badge err",
  pending: "badge warn",
}

function truncate(s: string, max = 80): string {
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + "…"
}

export default async function NotificacionesPage() {
  const tenant = await resolveCurrentTenant()
  const [notifications, counts] = await Promise.all([
    db.notification.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { bookingRequest: { select: { id: true, shortCode: true } } },
    }),
    db.notification.groupBy({
      by: ["status"],
      where: { tenantId: tenant.id },
      _count: { _all: true },
    }),
  ])

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Centro de Mensajería</h1>
        <p className="muted" style={{ margin: 0 }}>
          Historial de notificaciones enviadas (WhatsApp). Cada lead del funnel dispara una al WhatsApp del tenant.
          Las fallidas pueden reintentarse.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span className="badge ok">{countByStatus["sent"] ?? 0} enviadas</span>
        <span className="badge err">{countByStatus["failed"] ?? 0} fallidas</span>
        <span className="badge warn">{countByStatus["pending"] ?? 0} pendientes</span>
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>
            Sin notificaciones aún. Cuando llegue un lead por el funnel (o se envíe una manual desde otra
            sección), aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 4, overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Cuando</th>
                <th>Tipo</th>
                <th>Destinatario</th>
                <th>Mensaje</th>
                <th>Ref.</th>
                <th>Status</th>
                <th>Reintentos</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {(n.sentAt ?? n.createdAt).toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td>
                    <code style={{ fontSize: 11 }}>{n.type}</code>
                  </td>
                  <td>
                    <code style={{ fontSize: 11 }}>{n.recipient}</code>
                  </td>
                  <td style={{ maxWidth: 320 }}>
                    {truncate(n.message)}
                    {n.errorDetails ? (
                      <>
                        <br />
                        <span style={{ fontSize: 11, color: "#fb7185" }}>err: {truncate(n.errorDetails, 100)}</span>
                      </>
                    ) : null}
                  </td>
                  <td>
                    {n.bookingRequest ? (
                      <Link href={`/admin/ventas/${n.bookingRequest.id}`} style={{ textDecoration: "none" }}>
                        <code style={{ fontSize: 11, color: "var(--primary)" }}>{n.bookingRequest.shortCode}</code>
                      </Link>
                    ) : "—"}
                  </td>
                  <td>
                    <span className={STATUS_BADGE[n.status] ?? "badge muted"}>{n.status}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>{n.retries}</td>
                  <td style={{ textAlign: "right" }}>
                    {n.status === "failed" ? (
                      <form action={retryNotificationAction} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={n.id} />
                        <button
                          className="button secondary"
                          type="submit"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          Reintentar
                        </button>
                      </form>
                    ) : null}
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
