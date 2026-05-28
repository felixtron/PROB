"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { loginAction, type LoginActionState } from "@/app/login/actions"

const initialState: LoginActionState = { ok: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Entrando..." : "Entrar"}
    </button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
      {state.message ? (
        <div className="card" style={{ borderColor: "#fb7185", padding: 14, color: "#fecdd3" }}>
          {state.message}
        </div>
      ) : null}

      <div className="field">
        <label>Email</label>
        <input name="email" type="email" autoComplete="email" />
      </div>
      <div className="field">
        <label>Contraseña</label>
        <input name="password" type="password" autoComplete="current-password" />
      </div>

      <SubmitButton />
    </form>
  )
}
