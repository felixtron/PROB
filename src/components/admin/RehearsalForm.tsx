"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createRehearsalAction,
  updateRehearsalAction,
  deleteRehearsalAction,
  type RehearsalActionState,
} from "@/app/admin/ensayos/actions"

const initial: RehearsalActionState = { ok: false }

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

export type RehearsalInitialValues = {
  id?: string
  title: string
  date: string
  startTime: string
  endTime: string
  locationName: string
  address: string
  mapsLink: string
  goal: string
  notes: string
  status: "scheduled" | "done" | "cancelled"
}

export function RehearsalForm({
  initialValues,
  mode,
}: {
  initialValues: RehearsalInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createRehearsalAction : updateRehearsalAction
  const [state, formAction] = useActionState(action, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 18, display: "grid", gap: 12 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="field">
        <label>Título del ensayo</label>
        <input name="title" defaultValue={initialValues.title} placeholder="Ensayo general · pre-boda Lobato" />
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Fecha</label>
          <input name="date" type="date" defaultValue={initialValues.date} required />
        </div>
        <div className="field">
          <label>Hora inicio</label>
          <input name="startTime" type="time" defaultValue={initialValues.startTime} />
        </div>
        <div className="field">
          <label>Hora fin</label>
          <input name="endTime" type="time" defaultValue={initialValues.endTime} />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Locación</label>
          <input name="locationName" defaultValue={initialValues.locationName} placeholder="Estudio Polanco, Sala Norte..." />
        </div>
        <div className="field">
          <label>Estado</label>
          <select name="status" defaultValue={initialValues.status}>
            <option value="scheduled">Programado</option>
            <option value="done">Realizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Dirección</label>
          <input name="address" defaultValue={initialValues.address} />
        </div>
        <div className="field">
          <label>Maps link</label>
          <input name="mapsLink" type="url" defaultValue={initialValues.mapsLink} placeholder="https://maps..." />
        </div>
      </div>

      <div className="field">
        <label>Objetivo del ensayo</label>
        <textarea name="goal" defaultValue={initialValues.goal} placeholder="Pulir tracks #3 y #7, repasar transiciones..." />
      </div>

      <div className="field">
        <label>Notas internas</label>
        <textarea name="notes" defaultValue={initialValues.notes} placeholder="Llevar equipo extra, snacks, etc." />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Crear ensayo" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteRehearsalAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
