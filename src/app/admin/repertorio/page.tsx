import Link from "next/link"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { SongForm } from "@/components/admin/SongForm"

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
  const totalMinutes = songs
    .filter((s) => s.active)
    .reduce((acc, s) => acc + (s.durationMin ?? 0), 0)

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
            Producción
          </p>
          <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Repertorio</h1>
          <p className="muted" style={{ margin: 0 }}>
            Catálogo de canciones del proyecto. {activeCount} activa{activeCount === 1 ? "" : "s"}
            {totalMinutes > 0 ? ` · ~${totalMinutes} min totales` : ""}.
          </p>
        </div>
        <Link href="/admin/repertorio/setlists" className="button" style={{ padding: "10px 16px", fontSize: 14 }}>
          Ver setlists{setlistsCount > 0 ? ` (${setlistsCount})` : ""} →
        </Link>
      </div>

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

      {songs.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Aún no hay canciones. Agrega la primera arriba.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
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
