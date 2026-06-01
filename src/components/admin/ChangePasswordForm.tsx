"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { changeMyPasswordAction, type SecurityActionState } from "@/app/admin/security/actions"

const initial: SecurityActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Actualizando..." : "Cambiar contraseña"}
    </button>
  )
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changeMyPasswordAction, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="field">
        <label>Contraseña actual</label>
        <input name="currentPassword" type="password" autoComplete="current-password" />
      </div>
      <div className="field">
        <label>Nueva contraseña (mínimo 10 caracteres)</label>
        <input name="newPassword" type="password" autoComplete="new-password" />
      </div>
      <div className="field">
        <label>Confirmar nueva contraseña</label>
        <input name="confirmPassword" type="password" autoComplete="new-password" />
      </div>

      <div>
        <Submit />
      </div>
    </form>
  )
}
