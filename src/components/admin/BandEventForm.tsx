"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createBandEventAction,
  updateBandEventAction,
  deleteBandEventAction,
  type BandEventActionState,
} from "@/app/admin/eventualidades/actions"

const initial: BandEventActionState = { ok: false }

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

export type BandEventInitialValues = {
  id?: string
  title: string
  kind: string
  date: string
  endDate: string
  startTime: string
  endTime: string
  venueName: string
  city: string
  country: string
  ticketUrl: string
  publicNotes: string
  internalNotes: string
  published: boolean
  status: "scheduled" | "done" | "cancelled"
}

export function BandEventForm({
  initialValues,
  mode,
}: {
  initialValues: BandEventInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createBandEventAction : updateBandEventAction
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
          <input name="title" defaultValue={initialValues.title} placeholder="Residencia en Hotel Carlota" />
        </div>
        <div className="field">
          <label>Tipo</label>
          <select name="kind" defaultValue={initialValues.kind || "show"}>
            <option value="show">Show / Concierto</option>
            <option value="residencia">Residencia</option>
            <option value="festival">Festival</option>
            <option value="gira">Gira</option>
            <option value="grabacion">Grabación</option>
            <option value="otro">Otro</option>
          </select>
        </div>
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
          <label>Fecha de cierre (gira/residencia)</label>
          <input name="endDate" type="date" defaultValue={initialValues.endDate} />
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

      <div className="grid-3">
        <div className="field">
          <label>Lugar</label>
          <input name="venueName" defaultValue={initialValues.venueName} placeholder="Lunario, Foro Indie..." />
        </div>
        <div className="field">
          <label>Ciudad</label>
          <input name="city" defaultValue={initialValues.city} placeholder="CDMX" />
        </div>
        <div className="field">
          <label>País</label>
          <input name="country" defaultValue={initialValues.country} placeholder="México" />
        </div>
      </div>

      <div className="field">
        <label>Link de tickets</label>
        <input name="ticketUrl" type="url" defaultValue={initialValues.ticketUrl} placeholder="https://..." />
      </div>

      <div className="field">
        <label>Notas públicas (se muestran en el landing si está publicado)</label>
        <textarea
          name="publicNotes"
          defaultValue={initialValues.publicNotes}
          placeholder="Cover, edad mínima, link a tickets, etc."
        />
      </div>

      <div className="field">
        <label>Notas internas</label>
        <textarea
          name="internalNotes"
          defaultValue={initialValues.internalNotes}
          placeholder="Producción, logística, contactos..."
        />
      </div>

      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            name="published"
            type="checkbox"
            defaultChecked={initialValues.published}
            style={{ width: "auto" }}
          />
          <span>Publicar en el landing (sección de próximas fechas)</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Crear eventualidad" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteBandEventAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
