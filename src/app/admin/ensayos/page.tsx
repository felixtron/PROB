import Link from "next/link"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { RehearsalForm } from "@/components/admin/RehearsalForm"

export const dynamic = "force-dynamic"

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
}

export default async function EnsayosPage() {
  const tenant = await resolveCurrentTenant()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rehearsals = await db.rehearsal.findMany({
    where: { tenantId: tenant.id },
    orderBy: { date: "asc" },
    include: { _count: { select: { attendance: true } } },
  })

  const upcoming = rehearsals.filter((r) => r.date >= today && r.status !== "cancelled")
  const past = rehearsals.filter((r) => r.date < today || r.status === "cancelled")

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Gestión
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Agenda de ensayos</h1>
        <p className="muted" style={{ margin: 0 }}>
          Ensayos internos del proyecto. Invita músicos titulares y suplentes y trackea quién confirma o asiste.
        </p>
      </div>

      <RehearsalForm
        mode="create"
        initialValues={{
          title: "",
          date: "",
          startTime: "",
          endTime: "",
          locationName: "",
          address: "",
          mapsLink: "",
          goal: "",
          notes: "",
          status: "scheduled",
        }}
      />

      {rehearsals.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Aún no hay ensayos. Programa el primero arriba.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {upcoming.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                Próximos · {upcoming.length}
              </p>
              {upcoming.map((r) => (
                <RehearsalCard key={r.id} r={r} />
              ))}
            </div>
          ) : null}

          {past.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                Historial · {past.length}
              </p>
              {past.map((r) => (
                <RehearsalCard key={r.id} r={r} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )

  function RehearsalCard({ r }: { r: typeof rehearsals[number] }) {
    const statusColor = r.status === "cancelled" ? "err" : r.status === "done" ? "muted" : "ok"
    return (
      <Link
        href={`/admin/ensayos/${r.id}`}
        className="card"
        style={{
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {r.title}
            <span className={`badge ${statusColor}`}>{r.status}</span>
          </div>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
            {formatDate(r.date)}
            {r.startTime ? ` · ${r.startTime}${r.endTime ? `–${r.endTime}` : ""}` : ""}
            {r.locationName ? ` · ${r.locationName}` : ""}
          </p>
        </div>
        <div className="muted" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
          {r._count.attendance} {r._count.attendance === 1 ? "músico" : "músicos"}
        </div>
      </Link>
    )
  }
}
