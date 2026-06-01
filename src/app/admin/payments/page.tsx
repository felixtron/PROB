import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"

export const dynamic = "force-dynamic"

function formatMoney(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100)
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    succeeded: "badge ok",
    failed: "badge err",
    refunded: "badge muted",
    processing: "badge warn",
  }
  return map[status] ?? "badge muted"
}

export default async function PaymentsPage() {
  const tenant = await resolveCurrentTenant()

  const payments = await db.payment.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ paidAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: 50,
  })

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Pagos</h1>
        <p className="muted" style={{ margin: 0 }}>
          Últimos 50 cobros recibidos por webhook de Stripe.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Aún no hay pagos registrados.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 4, overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Monto</th>
                <th>PaymentIntent</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const date = (p.paidAt ?? p.createdAt).toISOString().slice(0, 10)
                const customer = p.customerName || p.customerEmail || "—"
                const shortId = p.stripePaymentIntentId.slice(0, 12) + "…"
                return (
                  <tr key={p.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{date}</td>
                    <td>{customer}</td>
                    <td>{p.description || "—"}</td>
                    <td>
                      <span className={statusBadge(p.status)}>{p.status}</span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {formatMoney(p.amount, p.currency)}
                    </td>
                    <td>
                      <code style={{ fontSize: 11 }}>{shortId}</code>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
