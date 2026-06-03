"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createSetlistAction,
  updateSetlistAction,
  deleteSetlistAction,
  type SetlistActionState,
} from "@/app/admin/repertorio/setlists/actions"

const initial: SetlistActionState = { ok: false }

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

export type SetlistInitialValues = {
  id?: string
  name: string
  description: string
  active: boolean
}

export function SetlistForm({
  initialValues,
  mode,
}: {
  initialValues: SetlistInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createSetlistAction : updateSetlistAction
  const [state, formAction] = useActionState(action, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 18, display: "grid", gap: 12 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="field">
        <label>Nombre</label>
        <input name="name" defaultValue={initialValues.name} placeholder="Cocktail · Boda Lobato 24 may" />
      </div>

      <div className="field">
        <label>Descripción</label>
        <textarea
          name="description"
          defaultValue={initialValues.description}
          placeholder="Notas internas, tono general, momentos clave..."
        />
      </div>

      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            name="active"
            type="checkbox"
            defaultChecked={initialValues.active}
            style={{ width: "auto" }}
          />
          <span>Activa</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Crear setlist" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteSetlistAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
