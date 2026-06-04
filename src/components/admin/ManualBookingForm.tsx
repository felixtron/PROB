"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createBookingAction, type BookingActionState } from "@/app/admin/ventas/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: BookingActionState = { ok: false }
const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-border/40 bg-card px-4 py-2 text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none disabled:opacity-50 transition-all"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? "Creando..." : "Crear cotización / booking"}
    </Button>
  )
}

function FieldError({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  const msg = errors?.[name]?.[0]
  if (!msg) return null
  return <span className="text-red-600 text-xs">{msg}</span>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-base font-bold m-0 pb-2 border-b border-border/40">{title}</h3>
      {children}
    </section>
  )
}

export type ManualBookingFormProps = {
  clients: { id: string; name: string }[]
  packages: { id: string; name: string }[]
}

export function ManualBookingForm({ clients, packages }: ManualBookingFormProps) {
  const [state, formAction] = useActionState(createBookingAction, initial)

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-8">
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

      <Section title="Cliente">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientId">Cliente existente (opcional)</Label>
            <select id="clientId" name="clientId" defaultValue="" className={SELECT_CLASS}>
              <option value="">— Nuevo cliente, datos abajo —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientName">Nombre del cliente</Label>
            <Input id="clientName" name="clientName" placeholder="Si seleccionaste arriba, repite aquí" />
            <FieldError name="clientName" errors={state.fieldErrors} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientEmail">Email</Label>
            <Input id="clientEmail" name="clientEmail" type="email" autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientPhone">Teléfono</Label>
            <Input id="clientPhone" name="clientPhone" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientWhatsapp">WhatsApp</Label>
            <Input id="clientWhatsapp" name="clientWhatsapp" placeholder="521..." />
          </div>
        </div>
      </Section>

      <Section title="Paquete y evento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="packageId">Paquete</Label>
            <select id="packageId" name="packageId" defaultValue="" className={SELECT_CLASS}>
              <option value="">— Custom / sin paquete —</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venueType">Tipo de evento</Label>
            <Input id="venueType" name="venueType" placeholder="boda, corporativo, cumpleaños..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guestCount">Invitados aproximados</Label>
            <Input id="guestCount" name="guestCount" type="number" min={0} step="1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requestedDate">Fecha</Label>
            <Input id="requestedDate" name="requestedDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startTime">Hora inicio</Label>
            <Input id="startTime" name="startTime" type="time" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endTime">Hora fin</Label>
            <Input id="endTime" name="endTime" type="time" />
          </div>
        </div>
      </Section>

      <Section title="Ubicación">
        <div className="space-y-1.5">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" placeholder="Calle, número, colonia..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">Estado</Label>
            <Input id="state" name="state" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mapsLink">Maps link</Label>
          <Input id="mapsLink" name="mapsLink" placeholder="https://maps.app.goo.gl/..." />
        </div>
      </Section>

      <Section title="Cobro">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="baseAmount">Monto base</Label>
            <Input id="baseAmount" name="baseAmount" type="number" min={0} step="0.01" placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="depositAmount">Anticipo</Label>
            <Input id="depositAmount" name="depositAmount" type="number" min={0} step="0.01" placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentMethod">Método</Label>
            <select id="paymentMethod" name="paymentMethod" defaultValue="" className={SELECT_CLASS}>
              <option value="">— ninguno aún —</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="stripe">Stripe</option>
              <option value="mercadopago">MercadoPago</option>
            </select>
          </div>
        </div>
      </Section>

      <div className="space-y-1.5">
        <Label htmlFor="adminNote">Notas internas</Label>
        <Textarea
          id="adminNote"
          name="adminNote"
          placeholder="Detalles para el equipo, requisitos especiales..."
          rows={3}
        />
      </div>

      <div>
        <Submit />
      </div>
    </form>
  )
}
