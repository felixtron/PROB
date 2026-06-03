"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { loginAction, type LoginActionState } from "@/app/login/actions"

const initialState: LoginActionState = { ok: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      className="button"
      disabled={pending}
      type="submit"
      style={{ width: "100%", padding: "14px 16px", fontSize: 15 }}
    >
      {pending ? "Entrando..." : "Iniciar sesión"}
    </button>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form
      action={formAction}
      className="card"
      style={{ padding: 28, display: "grid", gap: 18 }}
    >
      {state.message ? (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(251, 113, 133, 0.08)",
            border: "1px solid rgba(251, 113, 133, 0.3)",
            color: "#9f1239",
            fontSize: 13,
          }}
        >
          {state.message}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="login-password">Contraseña</label>
        <div style={{ position: "relative" }}>
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            style={{ width: "100%", paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              padding: 6,
              color: "var(--muted-foreground)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
