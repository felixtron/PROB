"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createClientAction,
  updateClientAction,
  deleteClientAction,
  type ClientActionState,
} from "@/app/admin/clientes/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: ClientActionState = { ok: false }

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? pendingLabel : label}
    </Button>
  )
}

function DangerSubmit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="destructive" disabled={pending} className="gap-1.5 h-10 px-4">
      <Trash2 className="w-3.5 h-3.5" />
      {pending ? "..." : "Eliminar"}
    </Button>
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
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-5">
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
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
          <Input id="name" name="name" defaultValue={initialValues.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" name="company" defaultValue={initialValues.company} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={initialValues.email} autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rfc">RFC</Label>
          <Input id="rfc" name="rfc" defaultValue={initialValues.rfc} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" defaultValue={initialValues.phone} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={initialValues.whatsapp} placeholder="521..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" defaultValue={initialValues.city} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" name="state" defaultValue={initialValues.state} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" defaultValue={initialValues.notes} rows={3} />
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Agregar cliente" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteClientAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
