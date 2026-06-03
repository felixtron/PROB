import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { RehearsalForm } from "@/components/admin/RehearsalForm"
import {
  inviteMusicianAction,
  setAttendanceStatusAction,
  removeAttendanceAction,
} from "@/app/admin/ensayos/actions"

export const dynamic = "force-dynamic"

function isoDateInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const STATUS_LABELS: Record<string, string> = {
  invited: "Invitado",
  confirmed: "Confirmado",
  declined: "No asiste",
  attended: "Asistió",
}

const STATUS_BADGE: Record<string, string> = {
  invited: "muted",
  confirmed: "ok",
  declined: "err",
  attended: "ok",
}

export default async function RehearsalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenant = await resolveCurrentTenant()

  const rehearsal = await db.rehearsal.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      attendance: {
        include: { musician: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })
  if (!rehearsal) notFound()

  const invitedIds = new Set(rehearsal.attendance.map((a) => a.musicianId))
  const allMusicians = await db.musician.findMany({
    where: { tenantId: tenant.id, active: true },
    orderBy: [{ isTitular: "desc" }, { name: "asc" }],
  })
  const availableMusicians = allMusicians.filter((m) => !invitedIds.has(m.id))

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
            Ensayo
          </p>
          <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>{rehearsal.title}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            {rehearsal.date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {rehearsal.startTime ? ` · ${rehearsal.startTime}${rehearsal.endTime ? `–${rehearsal.endTime}` : ""}` : ""}
          </p>
        </div>
        <Link href="/admin/ensayos" className="button secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
          ← Volver
        </Link>
      </div>

      <RehearsalForm
        mode="edit"
        initialValues={{
          id: rehearsal.id,
          title: rehearsal.title,
          date: isoDateInput(rehearsal.date),
          startTime: rehearsal.startTime ?? "",
          endTime: rehearsal.endTime ?? "",
          locationName: rehearsal.locationName ?? "",
          address: rehearsal.address ?? "",
          mapsLink: rehearsal.mapsLink ?? "",
          goal: rehearsal.goal ?? "",
          notes: rehearsal.notes ?? "",
          status: rehearsal.status as "scheduled" | "done" | "cancelled",
        }}
      />

      <div className="card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Asistencia ({rehearsal.attendance.length})</h2>

        {rehearsal.attendance.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Aún no hay invitados. Invita músicos desde el selector de abajo.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {rehearsal.attendance.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--card)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {a.musician.name}
                    {!a.musician.isTitular ? <span className="badge muted" style={{ marginLeft: 8 }}>suplente</span> : null}
                  </div>
                  {a.musician.role ? (
                    <div className="muted" style={{ fontSize: 12 }}>{a.musician.role}</div>
                  ) : null}
                </div>
                <span className={`badge ${STATUS_BADGE[a.status] || "muted"}`}>{STATUS_LABELS[a.status] || a.status}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {(["confirmed", "declined", "attended"] as const).map((target) =>
                    a.status === target ? null : (
                      <form key={target} action={setAttendanceStatusAction} style={{ display: "inline" }}>
                        <input type="hidden" name="attendanceId" value={a.id} />
                        <input type="hidden" name="rehearsalId" value={rehearsal.id} />
                        <input type="hidden" name="status" value={target} />
                        <button
                          type="submit"
                          className="button secondary"
                          style={{ padding: "4px 8px", fontSize: 11 }}
                          title={`Marcar como ${STATUS_LABELS[target]}`}
                        >
                          → {STATUS_LABELS[target]}
                        </button>
                      </form>
                    ),
                  )}
                </div>
                <form action={removeAttendanceAction} style={{ display: "inline" }}>
                  <input type="hidden" name="attendanceId" value={a.id} />
                  <input type="hidden" name="rehearsalId" value={rehearsal.id} />
                  <button
                    type="submit"
                    className="button secondary"
                    style={{ padding: "4px 10px", fontSize: 12, color: "#fb7185", borderColor: "rgba(251,113,133,0.4)" }}
                  >
                    Quitar
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={inviteMusicianAction} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <input type="hidden" name="rehearsalId" value={rehearsal.id} />
          <div className="field" style={{ flex: 1, minWidth: 220 }}>
            <label>Invitar músico</label>
            <select name="musicianId" required defaultValue="">
              <option value="" disabled>
                {availableMusicians.length === 0
                  ? "Todos los músicos activos ya están invitados"
                  : "Elige un músico..."}
              </option>
              {availableMusicians.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.isTitular ? "" : " (suplente)"}{m.role ? ` — ${m.role}` : ""}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="button" disabled={availableMusicians.length === 0}>
            Invitar
          </button>
        </form>
      </div>
    </div>
  )
}
