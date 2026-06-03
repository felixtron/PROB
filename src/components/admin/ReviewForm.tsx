"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  type ReviewActionState,
} from "@/app/admin/testimoniales/actions"

const initial: ReviewActionState = { ok: false }

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

export type ReviewInitialValues = {
  id?: string
  clientName: string
  eventTitle: string
  eventDate: string // ISO yyyy-mm-dd or ""
  rating: number
  quote: string
  avatarUrl: string
  source: string
  published: boolean
}

export function ReviewForm({
  initialValues,
  mode,
}: {
  initialValues: ReviewInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createReviewAction : updateReviewAction
  const [state, formAction] = useActionState(action, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 18, display: "grid", gap: 12 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Cliente</label>
          <input name="clientName" defaultValue={initialValues.clientName} placeholder="María L." />
        </div>
        <div className="field">
          <label>Evento (opcional)</label>
          <input name="eventTitle" defaultValue={initialValues.eventTitle} placeholder="Boda en Punta Mita" />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Fecha del evento</label>
          <input name="eventDate" type="date" defaultValue={initialValues.eventDate} />
        </div>
        <div className="field">
          <label>Estrellas</label>
          <select name="rating" defaultValue={initialValues.rating}>
            <option value={5}>★★★★★</option>
            <option value={4}>★★★★☆</option>
            <option value={3}>★★★☆☆</option>
            <option value={2}>★★☆☆☆</option>
            <option value={1}>★☆☆☆☆</option>
          </select>
        </div>
        <div className="field">
          <label>Origen</label>
          <select name="source" defaultValue={initialValues.source || "manual"}>
            <option value="manual">Manual</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="google">Google</option>
            <option value="instagram">Instagram</option>
            <option value="email">Email</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Cita / testimonio</label>
        <textarea
          name="quote"
          defaultValue={initialValues.quote}
          placeholder="Lo que dijo el cliente. Idealmente entre 1 y 3 frases."
          style={{ minHeight: 120 }}
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Foto del cliente (URL)</label>
          <input name="avatarUrl" defaultValue={initialValues.avatarUrl} placeholder="https://..." />
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              name="published"
              type="checkbox"
              defaultChecked={initialValues.published}
              style={{ width: "auto" }}
            />
            <span>Publicar en el landing</span>
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Agregar testimonio" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteReviewAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
