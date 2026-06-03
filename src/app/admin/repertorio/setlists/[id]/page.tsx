import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUp, ArrowDown, X, Plus, Music } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { SetlistForm } from "@/components/admin/SetlistForm"
import {
  addSongToSetlistAction,
  removeSongFromSetlistAction,
  moveSongAction,
} from "@/app/admin/repertorio/setlists/actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
    <div className="p-8 bg-background min-h-full">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{setlist.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {setlist.songs.length} {setlist.songs.length === 1 ? "canción" : "canciones"}
            {totalMin > 0 ? ` · ~${totalMin} min totales` : ""}
          </p>
        </div>
        <Link href="/admin/repertorio/setlists" className="no-underline">
          <Button variant="outline" className="gap-2 h-10 px-4 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <SetlistForm
          mode="edit"
          initialValues={{
            id: setlist.id,
            name: setlist.name,
            description: setlist.description ?? "",
            active: setlist.active,
          }}
        />
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Canciones en orden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {setlist.songs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no hay canciones. Agrega la primera desde el formulario de abajo.
            </p>
          ) : (
            <div className="space-y-2">
              {setlist.songs.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2.5 border border-border rounded-lg bg-card"
                >
                  <span className="text-muted-foreground font-bold text-xs tabular-nums min-w-[24px] text-right">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">
                      {entry.song.title}
                      {entry.song.artist ? (
                        <span className="text-muted-foreground font-normal"> — {entry.song.artist}</span>
                      ) : null}
                    </div>
                    {entry.song.durationMin || entry.song.songKey ? (
                      <div className="text-muted-foreground text-xs">
                        {entry.song.songKey ? entry.song.songKey : null}
                        {entry.song.songKey && entry.song.durationMin ? " · " : null}
                        {entry.song.durationMin ? `${entry.song.durationMin} min` : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <form action={moveSongAction}>
                      <input type="hidden" name="setlistSongId" value={entry.id} />
                      <input type="hidden" name="setlistId" value={setlist.id} />
                      <input type="hidden" name="direction" value="up" />
                      <Button type="submit" variant="outline" size="icon-sm" disabled={idx === 0} aria-label="Mover arriba">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                    <form action={moveSongAction}>
                      <input type="hidden" name="setlistSongId" value={entry.id} />
                      <input type="hidden" name="setlistId" value={setlist.id} />
                      <input type="hidden" name="direction" value="down" />
                      <Button type="submit" variant="outline" size="icon-sm" disabled={idx === setlist.songs.length - 1} aria-label="Mover abajo">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                    <form action={removeSongFromSetlistAction}>
                      <input type="hidden" name="setlistSongId" value={entry.id} />
                      <input type="hidden" name="setlistId" value={setlist.id} />
                      <Button type="submit" variant="destructive" size="icon-sm" aria-label="Quitar">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form action={addSongToSetlistAction} className="flex gap-2 items-end flex-wrap pt-2">
            <input type="hidden" name="setlistId" value={setlist.id} />
            <div className="field flex-1 min-w-[220px]">
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Agregar canción</label>
              <select
                name="songId"
                required
                defaultValue=""
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
              >
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
            <Button type="submit" disabled={unassignedSongs.length === 0} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </Button>
          </form>

          {availableSongs.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              No hay canciones activas en el repertorio aún.{" "}
              <Link href="/admin/repertorio" className="underline">
                Agregar canciones
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
