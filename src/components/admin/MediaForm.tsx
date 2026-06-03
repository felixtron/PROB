"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createMediaAction,
  updateMediaAction,
  deleteMediaAction,
  type MediaActionState,
} from "@/app/admin/media/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const initial: MediaActionState = { ok: false }
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

export type MediaInitialValues = {
  id?: string
  kind: string
  title: string
  alt: string
  url: string
  thumbnailUrl: string
  caption: string
  linkUrl: string
  sortOrder: number
  published: boolean
}

export function MediaForm({
  initialValues,
  mode,
}: {
  initialValues: MediaInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createMediaAction : updateMediaAction
  const [state, formAction] = useActionState(action, initial)

  const isPress = initialValues.kind === "press"

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
          <Label htmlFor="kind">Tipo</Label>
          <select id="kind" name="kind" defaultValue={initialValues.kind || "gallery"} className={SELECT_CLASS}>
            <option value="gallery">Galería (foto del proyecto)</option>
            <option value="press">Press (logo de medio que cubrió al artista)</option>
            <option value="hero">Hero / Banner principal</option>
            <option value="promo">Promo / Card destacada</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Título interno (opcional)</Label>
          <Input id="title" name="title" defaultValue={initialValues.title} placeholder="Sesión con A.M., Vogue feature..." />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="url">URL del archivo</Label>
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={initialValues.url}
          placeholder="https://res.cloudinary.com/... o https://drive.../uc?id=..."
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="alt">Texto alternativo (accesibilidad y SEO)</Label>
        <Input
          id="alt"
          name="alt"
          defaultValue={initialValues.alt}
          placeholder={isPress ? "Logo de Vogue México" : "Priscilla cantando en Lunario"}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="thumbnailUrl">Thumbnail / preview (opcional)</Label>
          <Input id="thumbnailUrl" name="thumbnailUrl" type="url" defaultValue={initialValues.thumbnailUrl} placeholder="https://..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="linkUrl">Link de destino (opcional, para press)</Label>
          <Input
            id="linkUrl"
            name="linkUrl"
            type="url"
            defaultValue={initialValues.linkUrl}
            placeholder={isPress ? "https://vogue.mx/articulo..." : "https://..."}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="caption">Pie de foto / descripción (opcional)</Label>
        <Input id="caption" name="caption" defaultValue={initialValues.caption} placeholder="Concierto Lunario, septiembre 2025" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sortOrder">Orden (menor primero)</Label>
          <Input id="sortOrder" name="sortOrder" type="number" step={1} defaultValue={initialValues.sortOrder} />
        </div>
        <div className="flex items-center self-end gap-2 pb-2">
          <input
            id="published"
            name="published"
            type="checkbox"
            defaultChecked={initialValues.published}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <Label htmlFor="published" className="cursor-pointer">Publicado en el landing</Label>
        </div>
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Agregar media" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteMediaAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
