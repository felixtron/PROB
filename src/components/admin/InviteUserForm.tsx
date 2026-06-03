"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2, UserPlus } from "lucide-react"
import { inviteUserAction, deleteUserAction, type UsersActionState } from "@/app/admin/users/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const initial: UsersActionState = { ok: false }
const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-border/40 bg-card px-4 py-2 text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none disabled:opacity-50 transition-all"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-1.5 h-10 px-5 font-bold">
      <UserPlus className="w-4 h-4" />
      {pending ? "Creando..." : "Crear usuario"}
    </Button>
  )
}

export function InviteUserForm() {
  const [state, formAction] = useActionState(inviteUserAction, initial)

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-5">
      <h3 className="text-base font-bold m-0">Invitar usuario</h3>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña inicial (mín. 10)</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Rol</Label>
          <select id="role" name="role" defaultValue="STAFF" className={SELECT_CLASS}>
            <option value="TENANT_ADMIN">Admin del tenant</option>
            <option value="STAFF">Staff</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground m-0">
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
    <Button type="submit" variant="destructive" size="sm" disabled={pending} className="gap-1.5 text-xs">
      <Trash2 className="w-3 h-3" />
      {pending ? "..." : "Eliminar"}
    </Button>
  )
}

export function DeleteUserButton({ id, disabled, disabledReason }: { id: string; disabled?: boolean; disabledReason?: string }) {
  if (disabled) {
    return (
      <span className="text-xs text-muted-foreground italic" title={disabledReason}>
        {disabledReason ?? "—"}
      </span>
    )
  }
  return (
    <form action={deleteUserAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <DeleteSubmit />
    </form>
  )
}
