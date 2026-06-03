"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createBandEventAction,
  updateBandEventAction,
  deleteBandEventAction,
  type BandEventActionState,
} from "@/app/admin/eventualidades/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: BandEventActionState = { ok: false }
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

export type BandEventInitialValues = {
  id?: string
  title: string
  kind: string
  date: string
  endDate: string
  startTime: string
  endTime: string
  venueName: string
  city: string
  country: string
  ticketUrl: string
  publicNotes: string
  internalNotes: string
  published: boolean
  status: "scheduled" | "done" | "cancelled"
}

export function BandEventForm({
  initialValues,
  mode,
}: {
  initialValues: BandEventInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createBandEventAction : updateBandEventAction
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
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" defaultValue={initialValues.title} placeholder="Residencia en Hotel Carlota" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kind">Tipo</Label>
          <select id="kind" name="kind" defaultValue={initialValues.kind || "show"} className={SELECT_CLASS}>
            <option value="show">Show / Concierto</option>
            <option value="residencia">Residencia</option>
            <option value="festival">Festival</option>
            <option value="gira">Gira</option>
            <option value="grabacion">Grabación</option>
            <option value="otro">Otro</option>
          </select>
        </div>
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
          <Label htmlFor="endDate">Fecha de cierre (gira/residencia)</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={initialValues.endDate} />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="venueName">Lugar</Label>
          <Input id="venueName" name="venueName" defaultValue={initialValues.venueName} placeholder="Lunario, Foro Indie..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" defaultValue={initialValues.city} placeholder="CDMX" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">País</Label>
          <Input id="country" name="country" defaultValue={initialValues.country} placeholder="México" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ticketUrl">Link de tickets</Label>
        <Input id="ticketUrl" name="ticketUrl" type="url" defaultValue={initialValues.ticketUrl} placeholder="https://..." />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="publicNotes">Notas públicas (se muestran en el landing si está publicado)</Label>
        <Textarea
          id="publicNotes"
          name="publicNotes"
          defaultValue={initialValues.publicNotes}
          placeholder="Cover, edad mínima, link a tickets, etc."
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="internalNotes">Notas internas</Label>
        <Textarea
          id="internalNotes"
          name="internalNotes"
          defaultValue={initialValues.internalNotes}
          placeholder="Producción, logística, contactos..."
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={initialValues.published}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <Label htmlFor="published" className="cursor-pointer">
          Publicar en el landing (sección de próximas fechas)
        </Label>
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Crear eventualidad" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteBandEventAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
