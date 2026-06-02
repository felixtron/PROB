import Link from "next/link"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"

export const dynamic = "force-dynamic"

const STATUS_BADGE: Record<string, string> = {
  pending: "badge warn",
  responded: "badge ok",
  archived: "badge muted",
}

function truncate(s: string, max = 120): string {
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + "…"
}

export default async function InboxPage() {
  const tenant = await resolveCurrentTenant()
  const items = await db.inboxItem.findMany({
    where: { tenantId: tenant.id },
    orderBy: { receivedAt: "desc" },
    take: 100,
    include: { client: { select: { name: true } } },
  })

  const integrations = await db.integrationSettings.findUnique({ where: { tenantId: tenant.id } })
  const evolutionConfigured = Boolean(
    integrations?.evolutionBaseUrl && integrations.evolutionInstance && integrations.evolutionApiKey,
  )

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Bandeja de Entrada</h1>
        <p className="muted" style={{ margin: 0 }}>
          Mensajes entrantes por WhatsApp (Evolution). Vinculamos al CRM cuando reconocemos el número.
        </p>
      </div>

      {!evolutionConfigured ? (
        <div className="card" style={{ padding: 16, borderColor: "rgba(251,191,36,0.4)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#fcd34d" }}>
            Evolution no está configurado.{" "}
            <Link href="/admin/integrations" style={{ textDecoration: "underline" }}>
              Configúralo en Integraciones
            </Link>
            {" "}para recibir mensajes aquí.
          </p>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>
            Sin mensajes entrantes aún. Cuando alguien escriba al WhatsApp configurado, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 4, overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Recibido</th>
                <th>De</th>
                <th>Mensaje</th>
                <th>Cliente</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {i.receivedAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td>
                    <div>
                      <strong>{i.senderName ?? "Desconocido"}</strong>
                      <br />
                      <code className="muted" style={{ fontSize: 11 }}>{i.phoneNumber}</code>
                    </div>
                  </td>
                  <td style={{ maxWidth: 480 }}>{truncate(i.message)}</td>
                  <td>{i.client?.name ?? "—"}</td>
                  <td>
                    <span className={STATUS_BADGE[i.status] ?? "badge muted"}>{i.status}</span>
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
