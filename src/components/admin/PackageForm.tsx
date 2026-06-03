"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createPackageAction,
  updatePackageAction,
  deletePackageAction,
  type PackageActionState,
} from "@/app/admin/packages/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: PackageActionState = { ok: false }

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

export type PackageInitialValues = {
  id?: string
  name: string
  description: string
  basePrice: number
  minDuration: number
  includes: string
  active: boolean
}

export function PackageForm({
  initialValues,
  mode,
}: {
  initialValues: PackageInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createPackageAction : updatePackageAction
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
          <Label htmlFor="basePrice">Precio base</Label>
          <Input id="basePrice" name="basePrice" type="number" min={0} step="0.01" defaultValue={initialValues.basePrice} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="minDuration">Duración mínima (horas)</Label>
          <Input id="minDuration" name="minDuration" type="number" min={0} step="1" defaultValue={initialValues.minDuration} />
        </div>
        <div className="flex items-center self-end gap-2 pb-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={initialValues.active}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <Label htmlFor="active" className="cursor-pointer">Activo (visible para clientes)</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" defaultValue={initialValues.description} rows={3} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="includes">Incluye (una línea por item)</Label>
        <Textarea
          id="includes"
          name="includes"
          defaultValue={initialValues.includes}
          placeholder={"Sonido profesional\nLuces básicas\n4 horas de show"}
          rows={4}
        />
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Crear paquete" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deletePackageAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
