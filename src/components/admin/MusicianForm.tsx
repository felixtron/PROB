"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import {
  createMusicianAction,
  updateMusicianAction,
  deleteMusicianAction,
  type MusicianActionState,
} from "@/app/admin/musicians/actions"

const initial: MusicianActionState = { ok: false }

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

export type MusicianInitialValues = {
  id?: string
  name: string
  role: string
  instruments: string
  bio: string
  email: string
  whatsapp: string
  photoUrl: string
  active: boolean
  isTitular: boolean
  titularId: string
}

export type TitularOption = { id: string; name: string }

export function MusicianForm({
  initialValues,
  mode,
  titulares,
}: {
  initialValues: MusicianInitialValues
  mode: "create" | "edit"
  titulares: TitularOption[]
}) {
  const action = mode === "create" ? createMusicianAction : updateMusicianAction
  const [state, formAction] = useActionState(action, initial)
  const [isTitular, setIsTitular] = useState(initialValues.isTitular)

  // When editing, a suplente can't be set as substitute of itself.
  const availableTitulares = titulares.filter((t) => t.id !== initialValues.id)

  return (
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Tipo</label>
          <select
            name="isTitular"
            value={isTitular ? "on" : ""}
            onChange={(e) => setIsTitular(e.target.value === "on")}
          >
            <option value="on">Titular</option>
            <option value="">Suplente</option>
          </select>
        </div>
        {!isTitular ? (
          <div className="field">
            <label>Suplente de</label>
            <select name="titularId" defaultValue={initialValues.titularId}>
              <option value="">— Sin asignar —</option>
              {availableTitulares.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="titularId" value="" />
        )}
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Nombre</label>
          <input name="name" defaultValue={initialValues.name} />
        </div>
        <div className="field">
          <label>Rol / posición</label>
          <input name="role" defaultValue={initialValues.role} placeholder="Vocalista, Pianista, Productor..." />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" defaultValue={initialValues.email} autoComplete="off" />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input name="whatsapp" defaultValue={initialValues.whatsapp} placeholder="521..." />
        </div>
        <div className="field">
          <label>Foto URL</label>
          <input name="photoUrl" defaultValue={initialValues.photoUrl} placeholder="https://..." />
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              name="active"
              type="checkbox"
              defaultChecked={initialValues.active}
              style={{ width: "auto" }}
            />
            <span>Activo</span>
          </label>
        </div>
      </div>
      <div className="field">
        <label>Instrumentos (uno por línea)</label>
        <textarea
          name="instruments"
          defaultValue={initialValues.instruments}
          placeholder={"Voz\nPiano\nTeclado"}
        />
      </div>
      <div className="field">
        <label>Bio</label>
        <textarea name="bio" defaultValue={initialValues.bio} />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Agregar músico" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteMusicianAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
