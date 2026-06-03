"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createSongAction,
  updateSongAction,
  deleteSongAction,
  type SongActionState,
} from "@/app/admin/repertorio/actions"

const initial: SongActionState = { ok: false }

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? pendingLabel : label}
    </button>
  )
}

function DangerSubmit() {
  const { pending } = useFormStatus()
  return (
    <button
      className="button secondary"
      disabled={pending}
      type="submit"
      style={{ color: "#fb7185", borderColor: "rgba(251,113,133,0.4)" }}
    >
      {pending ? "..." : "Eliminar"}
    </button>
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
    <form action={formAction} className="card" style={{ padding: 18, display: "grid", gap: 12 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Título</label>
          <input name="title" defaultValue={initialValues.title} />
        </div>
        <div className="field">
          <label>Artista original</label>
          <input name="artist" defaultValue={initialValues.artist} placeholder="Stevie Wonder" />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Género</label>
          <input name="genre" defaultValue={initialValues.genre} placeholder="Jazz, Soul, R&B..." />
        </div>
        <div className="field">
          <label>Idioma</label>
          <input name="language" defaultValue={initialValues.language} placeholder="ES, EN, PT..." />
        </div>
        <div className="field">
          <label>Época</label>
          <input name="era" defaultValue={initialValues.era} placeholder="70s, 80s, contemporáneo..." />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Duración (min)</label>
          <input name="durationMin" type="number" min={0} step={1} defaultValue={initialValues.durationMin === "" ? "" : initialValues.durationMin} />
        </div>
        <div className="field">
          <label>Tonalidad</label>
          <input name="songKey" defaultValue={initialValues.songKey} placeholder="C, Dm, F#..." />
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              name="active"
              type="checkbox"
              defaultChecked={initialValues.active}
              style={{ width: "auto" }}
            />
            <span>Activa en el repertorio</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label>Notas</label>
        <textarea name="notes" defaultValue={initialValues.notes} placeholder="Arreglo especial, momento del show..." />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Agregar canción" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteSongAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
