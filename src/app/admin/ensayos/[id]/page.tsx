import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Users, X, UserPlus, Calendar, Clock } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { RehearsalForm } from "@/components/admin/RehearsalForm"
import {
  inviteMusicianAction,
  setAttendanceStatusAction,
  removeAttendanceAction,
} from "@/app/admin/ensayos/actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

function statusBadgeClass(status: string): string {
  switch (status) {
    case "confirmed":
    case "attended":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "declined":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    default:
      return "text-muted-foreground"
  }
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
    <div className="p-8 bg-background min-h-full">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{rehearsal.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2 flex-wrap capitalize">
            <Calendar className="w-3.5 h-3.5" />
            {rehearsal.date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {rehearsal.startTime ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>{rehearsal.startTime}{rehearsal.endTime ? `–${rehearsal.endTime}` : ""}</span>
              </>
            ) : null}
          </p>
        </div>
        <Link href="/admin/ensayos" className="no-underline">
          <Button variant="outline" className="gap-2 h-10 px-4 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="mb-6">
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
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Asistencia ({rehearsal.attendance.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rehearsal.attendance.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no hay invitados. Invita músicos desde el selector de abajo.
            </p>
          ) : (
            <div className="space-y-2">
              {rehearsal.attendance.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-2.5 border border-border rounded-lg bg-card flex-wrap"
                >
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{a.musician.name}</span>
                      {!a.musician.isTitular ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">suplente</Badge>
                      ) : null}
                    </div>
                    {a.musician.role ? (
                      <div className="text-muted-foreground text-xs">{a.musician.role}</div>
                    ) : null}
                  </div>
                  <Badge variant="outline" className={statusBadgeClass(a.status)}>
                    {STATUS_LABELS[a.status] || a.status}
                  </Badge>
                  <div className="flex gap-1.5">
                    {(["confirmed", "declined", "attended"] as const).map((target) =>
                      a.status === target ? null : (
                        <form key={target} action={setAttendanceStatusAction}>
                          <input type="hidden" name="attendanceId" value={a.id} />
                          <input type="hidden" name="rehearsalId" value={rehearsal.id} />
                          <input type="hidden" name="status" value={target} />
                          <Button type="submit" variant="outline" size="xs" title={`Marcar como ${STATUS_LABELS[target]}`}>
                            → {STATUS_LABELS[target]}
                          </Button>
                        </form>
                      ),
                    )}
                  </div>
                  <form action={removeAttendanceAction}>
                    <input type="hidden" name="attendanceId" value={a.id} />
                    <input type="hidden" name="rehearsalId" value={rehearsal.id} />
                    <Button type="submit" variant="destructive" size="icon-sm" aria-label="Quitar">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}

          <form action={inviteMusicianAction} className="flex gap-2 items-end flex-wrap pt-2">
            <input type="hidden" name="rehearsalId" value={rehearsal.id} />
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Invitar músico</label>
              <select
                name="musicianId"
                required
                defaultValue=""
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="" disabled>
                  {availableMusicians.length === 0
                    ? "Todos los músicos activos ya están invitados"
                    : "Elige un músico..."}
                </option>
                {availableMusicians.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.isTitular ? "" : " (suplente)"}
                    {m.role ? ` — ${m.role}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={availableMusicians.length === 0} className="gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Invitar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
