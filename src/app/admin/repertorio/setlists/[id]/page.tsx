import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { SetlistForm } from "@/components/admin/SetlistForm"
import {
  addSongToSetlistAction,
  removeSongFromSetlistAction,
  moveSongAction,
} from "@/app/admin/repertorio/setlists/actions"

export const dynamic = "force-dynamic"

export default async function SetlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenant = await resolveCurrentTenant()

  const setlist = await db.setlist.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      songs: {
        orderBy: { position: "asc" },
        include: { song: true },
      },
    },
  })
  if (!setlist) notFound()

  const assignedSongIds = new Set(setlist.songs.map((s) => s.songId))
  const availableSongs = await db.song.findMany({
    where: { tenantId: tenant.id, active: true },
    orderBy: { title: "asc" },
  })
  const unassignedSongs = availableSongs.filter((s) => !assignedSongIds.has(s.id))

  const totalMin = setlist.songs.reduce((acc, s) => acc + (s.song.durationMin ?? 0), 0)

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
            Setlist
          </p>
          <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>{setlist.name}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {setlist.songs.length} {setlist.songs.length === 1 ? "canción" : "canciones"}
            {totalMin > 0 ? ` · ~${totalMin} min totales` : ""}
          </p>
        </div>
        <Link href="/admin/repertorio/setlists" className="button secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
          ← Volver
        </Link>
      </div>

      <SetlistForm
        mode="edit"
        initialValues={{
          id: setlist.id,
          name: setlist.name,
          description: setlist.description ?? "",
          active: setlist.active,
        }}
      />

      <div className="card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Canciones en orden</h2>

        {setlist.songs.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Aún no hay canciones. Agrega la primera desde el formulario de abajo.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {setlist.songs.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--card)",
                }}
              >
                <span
                  className="muted"
                  style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 13, minWidth: 24 }}
                >
                  {idx + 1}.
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {entry.song.title}
                    {entry.song.artist ? (
                      <span className="muted" style={{ fontWeight: 400 }}> — {entry.song.artist}</span>
                    ) : null}
                  </div>
                  {entry.song.durationMin || entry.song.songKey ? (
                    <div className="muted" style={{ fontSize: 12 }}>
                      {entry.song.songKey ? `${entry.song.songKey}` : null}
                      {entry.song.songKey && entry.song.durationMin ? " · " : null}
                      {entry.song.durationMin ? `${entry.song.durationMin} min` : null}
                    </div>
                  ) : null}
                </div>
                <form action={moveSongAction} style={{ display: "inline" }}>
                  <input type="hidden" name="setlistSongId" value={entry.id} />
                  <input type="hidden" name="setlistId" value={setlist.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    className="button secondary"
                    disabled={idx === 0}
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    aria-label="Mover arriba"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveSongAction} style={{ display: "inline" }}>
                  <input type="hidden" name="setlistSongId" value={entry.id} />
                  <input type="hidden" name="setlistId" value={setlist.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    className="button secondary"
                    disabled={idx === setlist.songs.length - 1}
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    aria-label="Mover abajo"
                  >
                    ↓
                  </button>
                </form>
                <form action={removeSongFromSetlistAction} style={{ display: "inline" }}>
                  <input type="hidden" name="setlistSongId" value={entry.id} />
                  <input type="hidden" name="setlistId" value={setlist.id} />
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

        <form action={addSongToSetlistAction} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <input type="hidden" name="setlistId" value={setlist.id} />
          <div className="field" style={{ flex: 1, minWidth: 220 }}>
            <label>Agregar canción</label>
            <select name="songId" required defaultValue="">
              <option value="" disabled>
                {unassignedSongs.length === 0
                  ? "Todas las canciones activas ya están en este setlist"
                  : "Elige una canción..."}
              </option>
              {unassignedSongs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                  {s.artist ? ` — ${s.artist}` : ""}
                  {s.durationMin ? ` (${s.durationMin}m)` : ""}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="button" disabled={unassignedSongs.length === 0}>
            Agregar
          </button>
        </form>

        {availableSongs.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>
            No hay canciones activas en el repertorio aún.{" "}
            <Link href="/admin/repertorio" style={{ textDecoration: "underline" }}>Agregar canciones</Link>
          </p>
        ) : null}
      </div>
    </div>
  )
}
