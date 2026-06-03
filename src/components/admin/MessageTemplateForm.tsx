"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Trash2, Send } from "lucide-react"
import {
  createMessageTemplateAction,
  updateMessageTemplateAction,
  deleteMessageTemplateAction,
  sendTestMessageAction,
  type MessageActionState,
} from "@/app/admin/messages/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: MessageActionState = { ok: false }

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? pendingLabel : label}
    </Button>
  )
}

function DangerSubmit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="destructive" disabled={pending} className="gap-1.5 h-10 px-4">
      <Trash2 className="w-3.5 h-3.5" />
      {pending ? pendingLabel : label}
    </Button>
  )
}

function detectVars(content: string) {
  const found = new Set<string>()
  for (const match of content.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) found.add(match[1])
  return Array.from(found)
}

function VarsBadges({ vars }: { vars: string[] }) {
  if (vars.length === 0) return null
  return (
    <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap m-0">
      <span className="font-medium">Variables:</span>
      {vars.map((v) => (
        <code key={v} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-mono">
          {`{{${v}}}`}
        </code>
      ))}
    </p>
  )
}

export function CreateTemplateForm() {
  const [state, formAction] = useActionState(createMessageTemplateAction, initial)
  const [content, setContent] = useState("")
  const vars = detectVars(content)

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-5">
      <h3 className="text-base font-bold m-0">Nueva plantilla</h3>
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
          <Label htmlFor="key">Key (identificador, no se puede cambiar después)</Label>
          <Input id="key" name="key" placeholder="booking-confirmation" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="label">Etiqueta</Label>
          <Input id="label" name="label" placeholder="Confirmación de booking" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="content">Contenido (usa {`{{variable}}`} para sustituir)</Label>
        <Textarea
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Hola {{nombre}}, confirmamos tu evento para {{fecha}}."
          rows={4}
        />
        <VarsBadges vars={vars} />
      </div>
      <div>
        <Submit label="Crear plantilla" pendingLabel="Creando..." />
      </div>
    </form>
  )
}

export function EditTemplateForm({
  template,
}: {
  template: { id: string; key: string; label: string; content: string }
}) {
  const [state, formAction] = useActionState(updateMessageTemplateAction, initial)
  const [content, setContent] = useState(template.content)
  const vars = detectVars(content)

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-5">
      <input type="hidden" name="id" value={template.id} />
      <div className="flex justify-between items-baseline gap-2 flex-wrap">
        <h3 className="text-base font-bold m-0">{template.label}</h3>
        <code className="text-xs text-muted-foreground font-mono">{template.key}</code>
      </div>
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
        <Label htmlFor={`label-${template.id}`}>Etiqueta</Label>
        <Input id={`label-${template.id}`} name="label" defaultValue={template.label} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`content-${template.id}`}>Contenido</Label>
        <Textarea
          id={`content-${template.id}`}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <VarsBadges vars={vars} />
      </div>
      <div className="flex gap-2 items-center pt-2 flex-wrap">
        <Submit label="Guardar" pendingLabel="Guardando..." />
        <form action={deleteMessageTemplateAction} className="inline">
          <input type="hidden" name="id" value={template.id} />
          <DangerSubmit label="Eliminar" pendingLabel="..." />
        </form>
        <SendTestInline templateKey={template.key} />
      </div>
    </form>
  )
}

function SendTestInline({ templateKey }: { templateKey: string }) {
  const [state, formAction] = useActionState(sendTestMessageAction, initial)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5 ml-auto"
      >
        <Send className="w-3.5 h-3.5" />
        Enviar test
      </Button>
    )
  }

  return (
    <form
      action={formAction}
      className="ml-auto rounded-xl border border-border/60 p-4 space-y-3 min-w-[280px] bg-card"
    >
      <input type="hidden" name="key" value={templateKey} />
      {state.message ? (
        <div
          className={`rounded-lg px-3 py-2 text-xs ${
            state.ok ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}
      <Input name="number" placeholder="Número (con código país)" />
      <Textarea name="varsText" placeholder={"nombre=Prisca\nfecha=2026-06-15"} rows={2} />
      <div className="flex gap-2">
        <Submit label="Enviar" pendingLabel="..." />
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
