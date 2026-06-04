"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateBookingAction, type BookingActionState } from "@/app/admin/ventas/actions"
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
      {pending ? "Guardando..." : "Guardar cambios"}
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

export type BookingDetailFormProps = {
  booking: {
    id: string
    clientId: string | null
    clientName: string
    clientEmail: string | null
    clientPhone: string | null
    clientWhatsapp: string | null
    packageId: string | null
    packageName: string | null
    guestCount: number | null
    venueType: string | null
    address: string | null
    city: string | null
    state: string | null
    mapsLink: string | null
    requestedDateISO: string | null
    startTime: string | null
    endTime: string | null
    baseAmountUnits: number
    depositAmountUnits: number
    paymentMethod: string | null
    paymentStatus: string
    status: string
    adminNote: string | null
  }
  clients: { id: string; name: string }[]
  packages: { id: string; name: string }[]
}

export function BookingDetailForm({ booking, clients, packages }: BookingDetailFormProps) {
  const [state, formAction] = useActionState(updateBookingAction, initial)

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-8">
      <input type="hidden" name="id" value={booking.id} />
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

      <Section title="Estado y status">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status del booking</Label>
            <select id="status" name="status" defaultValue={booking.status} className={SELECT_CLASS}>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentStatus">Status de pago</Label>
            <select id="paymentStatus" name="paymentStatus" defaultValue={booking.paymentStatus} className={SELECT_CLASS}>
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="failed">Falló</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentMethod">Método de pago</Label>
            <select id="paymentMethod" name="paymentMethod" defaultValue={booking.paymentMethod ?? ""} className={SELECT_CLASS}>
              <option value="">— sin definir —</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="stripe">Stripe</option>
              <option value="mercadopago">MercadoPago</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="Cliente">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientId">Cliente del CRM (opcional)</Label>
            <select id="clientId" name="clientId" defaultValue={booking.clientId ?? ""} className={SELECT_CLASS}>
              <option value="">— Sin vincular —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientName">Nombre del cliente</Label>
            <Input id="clientName" name="clientName" defaultValue={booking.clientName} />
            <FieldError name="clientName" errors={state.fieldErrors} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientEmail">Email</Label>
            <Input id="clientEmail" name="clientEmail" type="email" defaultValue={booking.clientEmail ?? ""} autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientPhone">Teléfono</Label>
            <Input id="clientPhone" name="clientPhone" defaultValue={booking.clientPhone ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientWhatsapp">WhatsApp</Label>
            <Input id="clientWhatsapp" name="clientWhatsapp" defaultValue={booking.clientWhatsapp ?? ""} placeholder="521..." />
          </div>
        </div>
      </Section>

      <Section title="Paquete y evento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="packageId">Paquete</Label>
            <select id="packageId" name="packageId" defaultValue={booking.packageId ?? ""} className={SELECT_CLASS}>
              <option value="">— Custom / sin paquete —</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venueType">Tipo de evento</Label>
            <Input id="venueType" name="venueType" defaultValue={booking.venueType ?? ""} placeholder="boda, corporativo, cumpleaños..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guestCount">Invitados</Label>
            <Input id="guestCount" name="guestCount" type="number" min={0} step="1" defaultValue={booking.guestCount ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requestedDate">Fecha</Label>
            <Input id="requestedDate" name="requestedDate" type="date" defaultValue={booking.requestedDateISO ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startTime">Hora inicio</Label>
            <Input id="startTime" name="startTime" type="time" defaultValue={booking.startTime ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endTime">Hora fin</Label>
            <Input id="endTime" name="endTime" type="time" defaultValue={booking.endTime ?? ""} />
          </div>
        </div>
      </Section>

      <Section title="Ubicación">
        <div className="space-y-1.5">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" defaultValue={booking.address ?? ""} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" defaultValue={booking.city ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">Estado</Label>
            <Input id="state" name="state" defaultValue={booking.state ?? ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mapsLink">Maps link</Label>
          <Input id="mapsLink" name="mapsLink" defaultValue={booking.mapsLink ?? ""} placeholder="https://maps.app.goo.gl/..." />
        </div>
      </Section>

      <Section title="Montos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="baseAmount">Monto base</Label>
            <Input id="baseAmount" name="baseAmount" type="number" min={0} step="0.01" defaultValue={booking.baseAmountUnits} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="depositAmount">Anticipo</Label>
            <Input id="depositAmount" name="depositAmount" type="number" min={0} step="0.01" defaultValue={booking.depositAmountUnits} />
          </div>
        </div>
      </Section>

      <div className="space-y-1.5">
        <Label htmlFor="adminNote">Notas internas</Label>
        <Textarea id="adminNote" name="adminNote" defaultValue={booking.adminNote ?? ""} rows={3} />
      </div>

      <div>
        <Submit />
      </div>
    </form>
  )
}
