"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { changeMyPasswordAction, type SecurityActionState } from "@/app/admin/security/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const initial: SecurityActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? "Actualizando..." : "Cambiar contraseña"}
    </Button>
  )
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changeMyPasswordAction, initial)

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-5">
      {state.message ? (
        <div
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            state.ok
              ? "bg-green-500/10 text-green-700 border border-green-500/30"
              : "bg-red-500/10 text-red-700 border border-red-500/30"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Nueva contraseña (mínimo 10 caracteres)</Label>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" />
      </div>

      <div>
        <Submit />
      </div>
    </form>
  )
}
