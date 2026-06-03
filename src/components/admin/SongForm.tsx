"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createSongAction,
  updateSongAction,
  deleteSongAction,
  type SongActionState,
} from "@/app/admin/repertorio/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: SongActionState = { ok: false }

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? pendingLabel : label}
    </Button>
  )
}

function DangerSubmit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="destructive" disabled={pending} className="gap-1.5 h-10 px-4">
      <Trash2 className="w-3.5 h-3.5" />
      {pending ? "..." : "Eliminar"}
    </Button>
  )
}

export type SongInitialValues = {
  id?: string
  title: string
  artist: string
  genre: string
  language: string
  era: string
  durationMin: number | ""
  songKey: string
  notes: string
  active: boolean
}

export function SongForm({
  initialValues,
  mode,
}: {
  initialValues: SongInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createSongAction : updateSongAction
  const [state, formAction] = useActionState(action, initial)

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-5">
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <div
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            state.ok
              ? "bg-green-500/10 text-green-700 border border-green-500/30"
              : "bg-red-500/10 text-red-700 border border-red-500/30"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" defaultValue={initialValues.title} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="artist">Artista original</Label>
          <Input id="artist" name="artist" defaultValue={initialValues.artist} placeholder="Stevie Wonder" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="genre">Género</Label>
          <Input id="genre" name="genre" defaultValue={initialValues.genre} placeholder="Jazz, Soul, R&B..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="language">Idioma</Label>
          <Input id="language" name="language" defaultValue={initialValues.language} placeholder="ES, EN, PT..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="era">Época</Label>
          <Input id="era" name="era" defaultValue={initialValues.era} placeholder="70s, 80s, contemporáneo..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="durationMin">Duración (min)</Label>
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            min={0}
            step={1}
            defaultValue={initialValues.durationMin === "" ? "" : initialValues.durationMin}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="songKey">Tonalidad</Label>
          <Input id="songKey" name="songKey" defaultValue={initialValues.songKey} placeholder="C, Dm, F#..." />
        </div>
        <div className="flex items-center self-end gap-2 pb-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={initialValues.active}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <Label htmlFor="active" className="cursor-pointer">Activa en el repertorio</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initialValues.notes}
          placeholder="Arreglo especial, momento del show..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Agregar canción" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteSongAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
