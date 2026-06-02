"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createClientAction,
  updateClientAction,
  deleteClientAction,
  type ClientActionState,
} from "@/app/admin/clientes/actions"

const initial: ClientActionState = { ok: false }

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

export type ClientInitialValues = {
  id?: string
  name: string
  email: string
  phone: string
  whatsapp: string
  company: string
  rfc: string
  notes: string
  city: string
  state: string
}

export function ClientForm({
  initialValues,
  mode,
}: {
  initialValues: ClientInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createClientAction : updateClientAction
  const [state, formAction] = useActionState(action, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Nombre</label>
          <input name="name" defaultValue={initialValues.name} />
        </div>
        <div className="field">
          <label>Empresa</label>
          <input name="company" defaultValue={initialValues.company} />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" defaultValue={initialValues.email} autoComplete="off" />
        </div>
        <div className="field">
          <label>RFC</label>
          <input name="rfc" defaultValue={initialValues.rfc} />
        </div>
        <div className="field">
          <label>Teléfono</label>
          <input name="phone" defaultValue={initialValues.phone} />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input name="whatsapp" defaultValue={initialValues.whatsapp} placeholder="521..." />
        </div>
        <div className="field">
          <label>Ciudad</label>
          <input name="city" defaultValue={initialValues.city} />
        </div>
        <div className="field">
          <label>Estado</label>
          <input name="state" defaultValue={initialValues.state} />
        </div>
      </div>
      <div className="field">
        <label>Notas</label>
        <textarea name="notes" defaultValue={initialValues.notes} />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Agregar cliente" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteClientAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
