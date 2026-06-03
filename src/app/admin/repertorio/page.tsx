import Link from "next/link"
import { Music, Clock, ListMusic, ArrowRight } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { SongForm } from "@/components/admin/SongForm"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function RepertorioPage() {
  const tenant = await resolveCurrentTenant()
  const [songs, setlistsCount] = await Promise.all([
    db.song.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ active: "desc" }, { title: "asc" }],
    }),
    db.setlist.count({ where: { tenantId: tenant.id } }),
  ])

  const activeCount = songs.filter((s) => s.active).length
  const inactiveCount = songs.length - activeCount
  const totalMinutes = songs.filter((s) => s.active).reduce((acc, s) => acc + (s.durationMin ?? 0), 0)

  const kpis = [
    { label: "Activas", value: activeCount, icon: Music, accent: "text-primary" },
    { label: "Catálogo total", value: songs.length, icon: ListMusic, accent: "text-blue-600" },
    {
      label: "Duración total",
      value: totalMinutes > 0 ? `${totalMinutes} min` : "—",
      icon: Clock,
      accent: "text-purple-600",
    },
    { label: "Inactivas", value: inactiveCount, icon: Music, accent: "text-muted-foreground" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Repertorio</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Catálogo de canciones del proyecto. Súmalas a setlists ordenados para shows y ensayos.
          </p>
        </div>
        <Link href="/admin/repertorio/setlists" className="no-underline">
          <Button variant="default" className="gap-2 h-10 px-4 text-sm font-bold">
            Ver setlists {setlistsCount > 0 ? `(${setlistsCount})` : ""}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* KPIs */}
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

      {/* Create form */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">
          Agregar al repertorio
        </h2>
        <SongForm
          mode="create"
          initialValues={{
            title: "",
            artist: "",
            genre: "",
            language: "",
            era: "",
            durationMin: "",
            songKey: "",
            notes: "",
            active: true,
          }}
        />
      </div>

      {/* Songs list */}
      {songs.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Aún no hay canciones. Agrega la primera arriba — empieza por las que tocas siempre.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Catálogo · {songs.length} canciones
          </h2>
          {songs.map((s) => (
            <SongForm
              key={s.id}
              mode="edit"
              initialValues={{
                id: s.id,
                title: s.title,
                artist: s.artist ?? "",
                genre: s.genre ?? "",
                language: s.language ?? "",
                era: s.era ?? "",
                durationMin: s.durationMin ?? "",
                songKey: s.songKey ?? "",
                notes: s.notes ?? "",
                active: s.active,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
