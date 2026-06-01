"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createMessageTemplateAction,
  updateMessageTemplateAction,
  deleteMessageTemplateAction,
  sendTestMessageAction,
  type MessageActionState,
} from "@/app/admin/messages/actions"

const initial: MessageActionState = { ok: false }

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? pendingLabel : label}
    </button>
  )
}

function DangerSubmit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      className="button secondary"
      disabled={pending}
      type="submit"
      style={{ color: "#fb7185", borderColor: "rgba(251,113,133,0.4)" }}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

function detectVars(content: string) {
  const found = new Set<string>()
  for (const match of content.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) found.add(match[1])
  return Array.from(found)
}

export function CreateTemplateForm() {
  const [state, formAction] = useActionState(createMessageTemplateAction, initial)
  const [content, setContent] = useState("")
  const vars = detectVars(content)

  return (
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
      <h3 style={{ margin: 0 }}>Nueva plantilla</h3>
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}
      <div className="grid-2">
        <div className="field">
          <label>Key (identificador, no se puede cambiar después)</label>
          <input name="key" placeholder="booking-confirmation" />
        </div>
        <div className="field">
          <label>Etiqueta</label>
          <input name="label" placeholder="Confirmación de booking" />
        </div>
      </div>
      <div className="field">
        <label>Contenido (usa {`{{variable}}`} para sustituir)</label>
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Hola {{nombre}}, confirmamos tu evento para {{fecha}}."
        />
        {vars.length > 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>
            Variables detectadas: {vars.map((v) => <code key={v} style={{ marginRight: 6 }}>{`{{${v}}}`}</code>)}
          </p>
        ) : null}
      </div>
      <div>
        <Submit label="Crear plantilla" pendingLabel="Creando..." />
      </div>
    </form>
  )
}

export function EditTemplateForm({
  template,
}: {
  template: { id: string; key: string; label: string; content: string }
}) {
  const [state, formAction] = useActionState(updateMessageTemplateAction, initial)
  const [content, setContent] = useState(template.content)
  const vars = detectVars(content)

  return (
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
      <input type="hidden" name="id" value={template.id} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0 }}>{template.label}</h3>
        <code className="muted" style={{ fontSize: 12 }}>{template.key}</code>
      </div>
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}
      <div className="field">
        <label>Etiqueta</label>
        <input name="label" defaultValue={template.label} />
      </div>
      <div className="field">
        <label>Contenido</label>
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {vars.length > 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>
            Variables: {vars.map((v) => <code key={v} style={{ marginRight: 6 }}>{`{{${v}}}`}</code>)}
          </p>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit label="Guardar" pendingLabel="Guardando..." />
        <form
          action={deleteMessageTemplateAction}
          style={{ display: "inline" }}
        >
          <input type="hidden" name="id" value={template.id} />
          <DangerSubmit label="Eliminar" pendingLabel="..." />
        </form>
        <SendTestInline templateKey={template.key} />
      </div>
    </form>
  )
}

function SendTestInline({ templateKey }: { templateKey: string }) {
  const [state, formAction] = useActionState(sendTestMessageAction, initial)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        className="button secondary"
        onClick={() => setOpen(true)}
        style={{ marginLeft: "auto" }}
      >
        Enviar test
      </button>
    )
  }

  return (
    <form
      action={formAction}
      style={{
        marginLeft: "auto",
        display: "grid",
        gap: 8,
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: 8,
        minWidth: 280,
      }}
    >
      <input type="hidden" name="key" value={templateKey} />
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 12 }}>{state.message}</p>
      ) : null}
      <input name="number" placeholder="Número (con código país)" />
      <textarea name="varsText" placeholder={"nombre=Prisca\nfecha=2026-06-15"} style={{ minHeight: 64 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <Submit label="Enviar" pendingLabel="..." />
        <button type="button" className="button secondary" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
