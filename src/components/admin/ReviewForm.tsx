"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  type ReviewActionState,
} from "@/app/admin/testimoniales/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: ReviewActionState = { ok: false }
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

export type ReviewInitialValues = {
  id?: string
  clientName: string
  eventTitle: string
  eventDate: string
  rating: number
  quote: string
  avatarUrl: string
  source: string
  published: boolean
}

export function ReviewForm({
  initialValues,
  mode,
}: {
  initialValues: ReviewInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createReviewAction : updateReviewAction
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
          <Label htmlFor="clientName">Cliente</Label>
          <Input id="clientName" name="clientName" defaultValue={initialValues.clientName} placeholder="María L." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="eventTitle">Evento (opcional)</Label>
          <Input id="eventTitle" name="eventTitle" defaultValue={initialValues.eventTitle} placeholder="Boda en Punta Mita" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="eventDate">Fecha del evento</Label>
          <Input id="eventDate" name="eventDate" type="date" defaultValue={initialValues.eventDate} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rating">Estrellas</Label>
          <select id="rating" name="rating" defaultValue={initialValues.rating} className={SELECT_CLASS}>
            <option value={5}>★★★★★</option>
            <option value={4}>★★★★☆</option>
            <option value={3}>★★★☆☆</option>
            <option value={2}>★★☆☆☆</option>
            <option value={1}>★☆☆☆☆</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source">Origen</Label>
          <select id="source" name="source" defaultValue={initialValues.source || "manual"} className={SELECT_CLASS}>
            <option value="manual">Manual</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="google">Google</option>
            <option value="instagram">Instagram</option>
            <option value="email">Email</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quote">Cita / testimonio</Label>
        <Textarea
          id="quote"
          name="quote"
          defaultValue={initialValues.quote}
          placeholder="Lo que dijo el cliente. Idealmente entre 1 y 3 frases."
          rows={5}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="avatarUrl">Foto del cliente (URL)</Label>
          <Input id="avatarUrl" name="avatarUrl" defaultValue={initialValues.avatarUrl} placeholder="https://..." />
        </div>
        <div className="flex items-center self-end gap-2 pb-2">
          <input
            id="published"
            name="published"
            type="checkbox"
            defaultChecked={initialValues.published}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <Label htmlFor="published" className="cursor-pointer">Publicar en el landing</Label>
        </div>
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Agregar testimonio" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteReviewAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
