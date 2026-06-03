import { Calendar, MapPin, ExternalLink } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { BandEventForm } from "@/components/admin/BandEventForm"
import { togglePublishedAction } from "@/app/admin/eventualidades/actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

  const kpis = [
    { label: "Total", value: events.length, icon: Calendar, accent: "text-primary" },
    { label: "Próximas", value: upcoming.length, icon: Calendar, accent: "text-blue-600" },
    { label: "Publicadas", value: publishedCount, icon: ExternalLink, accent: "text-green-600" },
    { label: "Historial", value: past.length, icon: MapPin, accent: "text-muted-foreground" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Eventualidades</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Shows propios, residencias, festivales, giras y grabaciones del proyecto.
          {publishedCount > 0 ? ` ${publishedCount} publicadas en el landing.` : ""}
        </p>
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

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">
          Nueva eventualidad
        </h2>
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
      </div>

      {events.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Aún no hay eventualidades. Agrega el primer show arriba.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Próximas · {upcoming.length}
              </h2>
              {upcoming.map((e) => (
                <EventRow key={e.id} e={e} />
              ))}
            </div>
          ) : null}

          {past.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Historial · {past.length}
              </h2>
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
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2 px-1">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Badge variant="outline" className="text-[10px] uppercase">{KIND_LABELS[e.kind] || e.kind}</Badge>
            <span>{e.date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</span>
            {e.venueName ? <span className="text-muted-foreground font-normal">· {e.venueName}</span> : null}
            {e.published ? (
              <Badge variant="outline" className="text-green-600 border-green-600/40 bg-green-600/5">
                publicado
              </Badge>
            ) : null}
          </div>
          <form action={togglePublishedAction}>
            <input type="hidden" name="id" value={e.id} />
            <Button type="submit" variant="outline" size="sm" className="text-xs">
              {e.published ? "Despublicar" : "Publicar"}
            </Button>
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
