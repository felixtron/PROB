"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createRehearsalAction,
  updateRehearsalAction,
  deleteRehearsalAction,
  type RehearsalActionState,
} from "@/app/admin/ensayos/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: RehearsalActionState = { ok: false }
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

export type RehearsalInitialValues = {
  id?: string
  title: string
  date: string
  startTime: string
  endTime: string
  locationName: string
  address: string
  mapsLink: string
  goal: string
  notes: string
  status: "scheduled" | "done" | "cancelled"
}

export function RehearsalForm({
  initialValues,
  mode,
}: {
  initialValues: RehearsalInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createRehearsalAction : updateRehearsalAction
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

      <div className="space-y-1.5">
        <Label htmlFor="title">Título del ensayo</Label>
        <Input id="title" name="title" defaultValue={initialValues.title} placeholder="Ensayo general · pre-boda Lobato" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" name="date" type="date" defaultValue={initialValues.date} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startTime">Hora inicio</Label>
          <Input id="startTime" name="startTime" type="time" defaultValue={initialValues.startTime} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endTime">Hora fin</Label>
          <Input id="endTime" name="endTime" type="time" defaultValue={initialValues.endTime} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="locationName">Locación</Label>
          <Input
            id="locationName"
            name="locationName"
            defaultValue={initialValues.locationName}
            placeholder="Estudio Polanco, Sala Norte..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Estado</Label>
          <select id="status" name="status" defaultValue={initialValues.status} className={SELECT_CLASS}>
            <option value="scheduled">Programado</option>
            <option value="done">Realizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" defaultValue={initialValues.address} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mapsLink">Maps link</Label>
          <Input id="mapsLink" name="mapsLink" type="url" defaultValue={initialValues.mapsLink} placeholder="https://maps..." />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="goal">Objetivo del ensayo</Label>
        <Textarea
          id="goal"
          name="goal"
          defaultValue={initialValues.goal}
          placeholder="Pulir tracks #3 y #7, repasar transiciones..."
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initialValues.notes}
          placeholder="Llevar equipo extra, snacks, etc."
          rows={2}
        />
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Crear ensayo" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteRehearsalAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
