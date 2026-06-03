import Link from "next/link"
import { Mic, Calendar, Users, MapPin } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { RehearsalForm } from "@/components/admin/RehearsalForm"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "cancelled":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    case "done":
      return "bg-muted text-muted-foreground"
    default:
      return "text-green-600 border-green-600/40 bg-green-600/5"
  }
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  done: "Realizado",
  cancelled: "Cancelado",
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

  const kpis = [
    { label: "Total", value: rehearsals.length, icon: Mic, accent: "text-primary" },
    { label: "Próximos", value: upcoming.length, icon: Calendar, accent: "text-blue-600" },
    { label: "Historial", value: past.length, icon: MapPin, accent: "text-muted-foreground" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Agenda de ensayos</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ensayos internos del proyecto. Invita músicos titulares y suplentes y trackea quién confirma o asiste.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
          Nuevo ensayo
        </h2>
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
      </div>

      {rehearsals.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">Aún no hay ensayos. Programa el primero arriba.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Próximos · {upcoming.length}
              </h2>
              {upcoming.map((r) => (
                <RehearsalCard key={r.id} r={r} />
              ))}
            </div>
          ) : null}

          {past.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Historial · {past.length}
              </h2>
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
    return (
      <Link href={`/admin/ensayos/${r.id}`} className="no-underline block">
        <Card className="bg-white p-4 hover:border-primary/40 transition-colors flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground">{r.title}</span>
                <Badge variant="outline" className={statusBadgeClass(r.status)}>
                  {STATUS_LABELS[r.status] || r.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs mt-1">
                {formatDate(r.date)}
                {r.startTime ? <span> · {r.startTime}{r.endTime ? `–${r.endTime}` : ""}</span> : null}
                {r.locationName ? <span> · {r.locationName}</span> : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs shrink-0">
            <Users className="w-3.5 h-3.5" />
            {r._count.attendance} {r._count.attendance === 1 ? "músico" : "músicos"}
          </div>
        </Card>
      </Link>
    )
  }
}
