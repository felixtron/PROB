"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createProviderAction,
  updateProviderAction,
  deleteProviderAction,
  type ProviderActionState,
} from "@/app/admin/proveedores/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: ProviderActionState = { ok: false }
const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-border/40 bg-card px-4 py-2 text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none disabled:opacity-50 transition-all"

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

export type ProviderInitialValues = {
  id?: string
  name: string
  category: string
  contactName: string
  email: string
  phone: string
  whatsapp: string
  city: string
  baseRate: number | ""
  currency: string
  notes: string
  active: boolean
}

const CATEGORY_OPTIONS = [
  "Sonido",
  "Iluminación",
  "Foto",
  "Video",
  "Tarima/Backline",
  "Transporte",
  "Decoración",
  "Catering",
  "Seguridad",
  "Coordinación",
  "Otro",
]

export function ProviderForm({
  initialValues,
  mode,
  tenantCurrency,
}: {
  initialValues: ProviderInitialValues
  mode: "create" | "edit"
  tenantCurrency: string
}) {
  const action = mode === "create" ? createProviderAction : updateProviderAction
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
          <Label htmlFor="name">Nombre del proveedor</Label>
          <Input id="name" name="name" defaultValue={initialValues.name} placeholder="Audio Pro CDMX" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Categoría</Label>
          <select id="category" name="category" defaultValue={initialValues.category} className={SELECT_CLASS}>
            <option value="">Selecciona...</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contactName">Persona de contacto</Label>
          <Input id="contactName" name="contactName" defaultValue={initialValues.contactName} placeholder="Juan Pérez" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" defaultValue={initialValues.city} placeholder="CDMX, Guadalajara..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" defaultValue={initialValues.phone} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={initialValues.whatsapp} placeholder="+52 55..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={initialValues.email} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="baseRate">Tarifa base</Label>
          <Input
            id="baseRate"
            name="baseRate"
            type="number"
            min={0}
            step={1}
            defaultValue={initialValues.baseRate === "" ? "" : initialValues.baseRate}
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Moneda</Label>
          <Input
            id="currency"
            name="currency"
            defaultValue={initialValues.currency || tenantCurrency}
            placeholder={tenantCurrency}
          />
        </div>
        <div className="flex items-center self-end gap-2 pb-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={initialValues.active}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <Label htmlFor="active" className="cursor-pointer">Activo</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initialValues.notes}
          placeholder="Condiciones, tiempos de entrega, casos en que conviene contratarlo..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Agregar proveedor" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteProviderAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
