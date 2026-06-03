import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { BandEventForm } from "@/components/admin/BandEventForm"
import { togglePublishedAction } from "@/app/admin/eventualidades/actions"

export const dynamic = "force-dynamic"

function isoDateInput(d: Date | null): string {
  if (!d) return ""
  return d.toISOString().slice(0, 10)
}

const KIND_LABELS: Record<string, string> = {
  show: "Show",
  residencia: "Residencia",
  festival: "Festival",
  gira: "Gira",
  grabacion: "Grabación",
  otro: "Otro",
}

export default async function EventualidadesPage() {
  const tenant = await resolveCurrentTenant()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const events = await db.bandEvent.findMany({
    where: { tenantId: tenant.id },
    orderBy: { date: "asc" },
  })

  const upcoming = events.filter((e) => e.date >= today && e.status !== "cancelled")
  const past = events.filter((e) => e.date < today || e.status === "cancelled")
  const publishedCount = events.filter((e) => e.published).length

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Gestión
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Eventualidades</h1>
        <p className="muted" style={{ margin: 0 }}>
          Shows propios, residencias, festivales, giras y grabaciones del proyecto.
          {publishedCount > 0 ? ` ${publishedCount} publicadas en el landing.` : ""}
        </p>
      </div>

      <BandEventForm
        mode="create"
        initialValues={{
          title: "",
          kind: "show",
          date: "",
          endDate: "",
          startTime: "",
          endTime: "",
          venueName: "",
          city: "",
          country: "",
          ticketUrl: "",
          publicNotes: "",
          internalNotes: "",
          published: false,
          status: "scheduled",
        }}
      />

      {events.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>
            Aún no hay eventualidades. Agrega el primer show arriba.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {upcoming.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                Próximas · {upcoming.length}
              </p>
              {upcoming.map((e) => (
                <EventRow key={e.id} e={e} />
              ))}
            </div>
          ) : null}

          {past.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                Historial · {past.length}
              </p>
              {past.map((e) => (
                <EventRow key={e.id} e={e} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )

  function EventRow({ e }: { e: typeof events[number] }) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "0 4px" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            {KIND_LABELS[e.kind] || e.kind} · {e.date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
            {e.venueName ? <span className="muted" style={{ fontWeight: 400 }}> · {e.venueName}</span> : null}
            {e.published ? <span className="badge ok" style={{ marginLeft: 8 }}>publicado</span> : null}
          </span>
          <form action={togglePublishedAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={e.id} />
            <button type="submit" className="button secondary" style={{ padding: "4px 10px", fontSize: 12 }}>
              {e.published ? "Despublicar" : "Publicar"}
            </button>
          </form>
        </div>
        <BandEventForm
          mode="edit"
          initialValues={{
            id: e.id,
            title: e.title,
            kind: e.kind,
            date: isoDateInput(e.date),
            endDate: isoDateInput(e.endDate),
            startTime: e.startTime ?? "",
            endTime: e.endTime ?? "",
            venueName: e.venueName ?? "",
            city: e.city ?? "",
            country: e.country ?? "",
            ticketUrl: e.ticketUrl ?? "",
            publicNotes: e.publicNotes ?? "",
            internalNotes: e.internalNotes ?? "",
            published: e.published,
            status: e.status as "scheduled" | "done" | "cancelled",
          }}
        />
      </div>
    )
  }
}
