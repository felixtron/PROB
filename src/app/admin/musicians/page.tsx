import { Users, AlertTriangle, CheckCircle, Calendar, Mic } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { MusicianForm } from "@/components/admin/MusicianForm"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

function parseInstruments(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

export default async function MusiciansPage() {
  const tenant = await resolveCurrentTenant()
  const now = new Date()

  const [musicians, upcomingEvents, upcomingRehearsals] = await Promise.all([
    db.musician.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ isTitular: "desc" }, { active: "desc" }, { name: "asc" }],
    }),
    db.event.count({
      where: { tenantId: tenant.id, date: { gte: now }, status: { not: "cancelled" } },
    }),
    db.rehearsal.count({
      where: { tenantId: tenant.id, date: { gte: now }, status: { not: "cancelled" } },
    }),
  ])

  const titulares = musicians.filter((m) => m.isTitular)
  const suplentes = musicians.filter((m) => !m.isTitular)
  const orphanSuplentes = suplentes.filter((s) => !s.titularId)
  const titularesOptions = titulares.map((t) => ({ id: t.id, name: t.name }))

  const activeTitulares = titulares.filter((t) => t.active)
  const activeSuplentes = suplentes.filter((s) => s.active)
  const atRiskTitulares = activeTitulares.filter(
    (t) => suplentes.filter((s) => s.titularId === t.id && s.active).length === 0,
  )

  function suplentesOf(titularId: string) {
    return suplentes.filter((s) => s.titularId === titularId)
  }

  const kpis = [
    { label: "Titulares", value: activeTitulares.length, icon: Users, accent: "text-primary" },
    { label: "Suplentes Activos", value: activeSuplentes.length, icon: CheckCircle, accent: "text-green-600" },
    {
      label: "En Riesgo",
      value: atRiskTitulares.length,
      icon: AlertTriangle,
      accent: atRiskTitulares.length > 0 ? "text-red-600" : "text-primary",
    },
    { label: "Shows próximos", value: upcomingEvents, icon: Calendar, accent: "text-blue-600" },
    { label: "Ensayos próximos", value: upcomingRehearsals, icon: Mic, accent: "text-purple-600" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Banda y Suplentes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Dashboard operativo de disponibilidad y cobertura. Cada titular puede tener suplentes asignados.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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

      {/* Create form */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">
          Agregar al roster
        </h2>
        <MusicianForm
          mode="create"
          titulares={titularesOptions}
          initialValues={{
            name: "",
            role: "",
            instruments: "",
            bio: "",
            email: "",
            whatsapp: "",
            photoUrl: "",
            active: true,
            isTitular: true,
            titularId: "",
          }}
        />
      </div>

      {/* Roster grouped */}
      {titulares.length === 0 && suplentes.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Aún no hay músicos en el roster. Agrega el primer titular arriba.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Roster · {titulares.length} titulares
          </h2>

          {titulares.map((m) => {
            const subs = suplentesOf(m.id)
            return (
              <div key={m.id} className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-xs font-black uppercase tracking-widest text-foreground">
                    {m.name}
                  </div>
                  {m.role ? <Badge variant="outline">{m.role}</Badge> : null}
                  {!m.active ? <Badge variant="outline" className="bg-muted text-muted-foreground">inactivo</Badge> : null}
                  {subs.length === 0 ? (
                    <Badge variant="outline" className="text-red-600 border-red-600/40 bg-red-600/5">
                      sin suplente
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600/40 bg-green-600/5">
                      {subs.length} suplente{subs.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>

                <MusicianForm
                  mode="edit"
                  titulares={titularesOptions}
                  initialValues={{
                    id: m.id,
                    name: m.name,
                    role: m.role ?? "",
                    instruments: parseInstruments(m.instruments).join("\n"),
                    bio: m.bio ?? "",
                    email: m.email ?? "",
                    whatsapp: m.whatsapp ?? "",
                    photoUrl: m.photoUrl ?? "",
                    active: m.active,
                    isTitular: true,
                    titularId: "",
                  }}
                />

                {subs.length > 0 ? (
                  <div className="pl-8 space-y-3 border-l-2 border-primary/20">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                      Suplentes de {m.name}
                    </p>
                    {subs.map((s) => (
                      <MusicianForm
                        key={s.id}
                        mode="edit"
                        titulares={titularesOptions}
                        initialValues={{
                          id: s.id,
                          name: s.name,
                          role: s.role ?? "",
                          instruments: parseInstruments(s.instruments).join("\n"),
                          bio: s.bio ?? "",
                          email: s.email ?? "",
                          whatsapp: s.whatsapp ?? "",
                          photoUrl: s.photoUrl ?? "",
                          active: s.active,
                          isTitular: false,
                          titularId: s.titularId ?? "",
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}

          {orphanSuplentes.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-red-600">
                  Suplentes sin titular asignado · {orphanSuplentes.length}
                </p>
              </div>
              {orphanSuplentes.map((s) => (
                <MusicianForm
                  key={s.id}
                  mode="edit"
                  titulares={titularesOptions}
                  initialValues={{
                    id: s.id,
                    name: s.name,
                    role: s.role ?? "",
                    instruments: parseInstruments(s.instruments).join("\n"),
                    bio: s.bio ?? "",
                    email: s.email ?? "",
                    whatsapp: s.whatsapp ?? "",
                    photoUrl: s.photoUrl ?? "",
                    active: s.active,
                    isTitular: false,
                    titularId: "",
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
