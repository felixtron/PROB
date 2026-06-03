"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"
import {
  createMusicianAction,
  updateMusicianAction,
  deleteMusicianAction,
  type MusicianActionState,
} from "@/app/admin/musicians/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: MusicianActionState = { ok: false }
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

export type MusicianInitialValues = {
  id?: string
  name: string
  role: string
  instruments: string
  bio: string
  email: string
  whatsapp: string
  photoUrl: string
  active: boolean
  isTitular: boolean
  titularId: string
}

export type TitularOption = { id: string; name: string }

export function MusicianForm({
  initialValues,
  mode,
  titulares,
}: {
  initialValues: MusicianInitialValues
  mode: "create" | "edit"
  titulares: TitularOption[]
}) {
  const action = mode === "create" ? createMusicianAction : updateMusicianAction
  const [state, formAction] = useActionState(action, initial)
  const [isTitular, setIsTitular] = useState(initialValues.isTitular)

  const availableTitulares = titulares.filter((t) => t.id !== initialValues.id)

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
          <Label htmlFor="isTitular">Tipo</Label>
          <select
            id="isTitular"
            name="isTitular"
            className={SELECT_CLASS}
            value={isTitular ? "on" : ""}
            onChange={(e) => setIsTitular(e.target.value === "on")}
          >
            <option value="on">Titular</option>
            <option value="">Suplente</option>
          </select>
        </div>
        {!isTitular ? (
          <div className="space-y-1.5">
            <Label htmlFor="titularId">Suplente de</Label>
            <select id="titularId" name="titularId" defaultValue={initialValues.titularId} className={SELECT_CLASS}>
              <option value="">— Sin asignar —</option>
              {availableTitulares.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="titularId" value="" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={initialValues.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Rol / posición</Label>
          <Input id="role" name="role" defaultValue={initialValues.role} placeholder="Vocalista, Pianista, Productor..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={initialValues.email} autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={initialValues.whatsapp} placeholder="521..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="photoUrl">Foto URL</Label>
          <Input id="photoUrl" name="photoUrl" defaultValue={initialValues.photoUrl} placeholder="https://..." />
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
        <Label htmlFor="instruments">Instrumentos (uno por línea)</Label>
        <Textarea
          id="instruments"
          name="instruments"
          defaultValue={initialValues.instruments}
          placeholder={"Voz\nPiano\nTeclado"}
          rows={4}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={initialValues.bio} rows={3} />
      </div>

      <div className="flex gap-2 items-center pt-2">
        <Submit
          label={mode === "create" ? "Agregar músico" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteMusicianAction} className="inline">
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
