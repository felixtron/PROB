"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { inviteUserAction, deleteUserAction, type UsersActionState } from "@/app/admin/users/actions"

const initial: UsersActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Creando..." : "Crear usuario"}
    </button>
  )
}

export function InviteUserForm() {
  const [state, formAction] = useActionState(inviteUserAction, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
      <h3 style={{ margin: 0 }}>Invitar usuario</h3>
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}
      <div className="grid-2">
        <div className="field">
          <label>Nombre</label>
          <input name="name" />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" autoComplete="off" />
        </div>
        <div className="field">
          <label>Contraseña inicial (mín. 10)</label>
          <input name="password" type="password" autoComplete="new-password" />
        </div>
        <div className="field">
          <label>Rol</label>
          <select name="role" defaultValue="STAFF">
            <option value="TENANT_ADMIN">Admin del tenant</option>
            <option value="STAFF">Staff</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 12 }}>
        El password debes comunicarlo tú al usuario; aún no se envía por email.
      </p>
      <div>
        <Submit />
      </div>
    </form>
  )
}

function DeleteSubmit() {
  const { pending } = useFormStatus()
  return (
    <button
      className="button secondary"
      disabled={pending}
      type="submit"
      style={{ color: "#fb7185", borderColor: "rgba(251,113,133,0.4)", padding: "6px 10px" }}
    >
      {pending ? "..." : "Eliminar"}
    </button>
  )
}

export function DeleteUserButton({ id, disabled, disabledReason }: { id: string; disabled?: boolean; disabledReason?: string }) {
  if (disabled) {
    return (
      <span className="muted" style={{ fontSize: 12 }} title={disabledReason}>
        {disabledReason ?? "—"}
      </span>
    )
  }
  return (
    <form action={deleteUserAction} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <DeleteSubmit />
    </form>
  )
}
