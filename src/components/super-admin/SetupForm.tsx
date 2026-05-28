"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createFirstSuperAdminAction, type SetupActionState } from "@/app/super-admin/setup/actions"

const initialState: SetupActionState = { ok: false }

function ErrorText({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  const message = errors?.[name]?.[0]
  if (!message) return null
  return <span style={{ color: "#fb7185", fontSize: 12 }}>{message}</span>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Creando..." : "Crear super admin"}
    </button>
  )
}

export function SetupForm() {
  const [state, formAction] = useActionState(createFirstSuperAdminAction, initialState)

  return (
    <form action={formAction} className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
      {state.message ? (
        <div className="card" style={{ borderColor: "#fb7185", padding: 14, color: "#fecdd3" }}>
          {state.message}
        </div>
      ) : null}

      <div className="field">
        <label>Nombre</label>
        <input name="name" />
        <ErrorText name="name" errors={state.fieldErrors} />
      </div>
      <div className="field">
        <label>Email</label>
        <input name="email" type="email" autoComplete="email" />
        <ErrorText name="email" errors={state.fieldErrors} />
      </div>
      <div className="field">
        <label>Contraseña</label>
        <input name="password" type="password" autoComplete="new-password" />
        <ErrorText name="password" errors={state.fieldErrors} />
      </div>

      <SubmitButton />
    </form>
  )
}
