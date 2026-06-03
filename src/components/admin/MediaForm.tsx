"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createMediaAction,
  updateMediaAction,
  deleteMediaAction,
  type MediaActionState,
} from "@/app/admin/media/actions"

const initial: MediaActionState = { ok: false }

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

export type MediaInitialValues = {
  id?: string
  kind: string
  title: string
  alt: string
  url: string
  thumbnailUrl: string
  caption: string
  linkUrl: string
  sortOrder: number
  published: boolean
}

export function MediaForm({
  initialValues,
  mode,
}: {
  initialValues: MediaInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createMediaAction : updateMediaAction
  const [state, formAction] = useActionState(action, initial)

  const isPress = initialValues.kind === "press"

  return (
    <form action={formAction} className="card" style={{ padding: 18, display: "grid", gap: 12 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Tipo</label>
          <select name="kind" defaultValue={initialValues.kind || "gallery"}>
            <option value="gallery">Galería (foto del proyecto)</option>
            <option value="press">Press (logo de medio que cubrió al artista)</option>
            <option value="hero">Hero / Banner principal</option>
            <option value="promo">Promo / Card destacada</option>
          </select>
        </div>
        <div className="field">
          <label>Título interno (opcional)</label>
          <input name="title" defaultValue={initialValues.title} placeholder="Sesión con A.M., Vogue feature..." />
        </div>
      </div>

      <div className="field">
        <label>URL del archivo</label>
        <input
          name="url"
          type="url"
          defaultValue={initialValues.url}
          placeholder="https://res.cloudinary.com/... o https://drive.../uc?id=..."
          required
        />
      </div>

      <div className="field">
        <label>Texto alternativo (accesibilidad y SEO)</label>
        <input
          name="alt"
          defaultValue={initialValues.alt}
          placeholder={isPress ? "Logo de Vogue México" : "Priscilla cantando en Lunario"}
          required
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Thumbnail / preview (opcional)</label>
          <input name="thumbnailUrl" type="url" defaultValue={initialValues.thumbnailUrl} placeholder="https://..." />
        </div>
        <div className="field">
          <label>Link de destino (opcional, para press)</label>
          <input
            name="linkUrl"
            type="url"
            defaultValue={initialValues.linkUrl}
            placeholder={isPress ? "https://vogue.mx/articulo..." : "https://..."}
          />
        </div>
      </div>

      <div className="field">
        <label>Pie de foto / descripción (opcional)</label>
        <input name="caption" defaultValue={initialValues.caption} placeholder="Concierto Lunario, septiembre 2025" />
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Orden (menor primero)</label>
          <input
            name="sortOrder"
            type="number"
            step={1}
            defaultValue={initialValues.sortOrder}
          />
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              name="published"
              type="checkbox"
              defaultChecked={initialValues.published}
              style={{ width: "auto" }}
            />
            <span>Publicado en el landing</span>
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Agregar media" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteMediaAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
