"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateBookingAction, type BookingActionState } from "@/app/admin/ventas/actions"

const initial: BookingActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  )
}

function FieldError({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  const msg = errors?.[name]?.[0]
  if (!msg) return null
  return <span style={{ color: "#fb7185", fontSize: 12 }}>{msg}</span>
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
    baseAmountUnits: number // in major units (pesos), already divided by 100
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
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 18 }}>
      <input type="hidden" name="id" value={booking.id} />
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Estado y status</h3>
        <div className="grid-3">
          <div className="field">
            <label>Status del booking</label>
            <select name="status" defaultValue={booking.status}>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
          <div className="field">
            <label>Status de pago</label>
            <select name="paymentStatus" defaultValue={booking.paymentStatus}>
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="failed">Falló</option>
            </select>
          </div>
          <div className="field">
            <label>Método de pago</label>
            <select name="paymentMethod" defaultValue={booking.paymentMethod ?? ""}>
              <option value="">— sin definir —</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="stripe">Stripe</option>
              <option value="mercadopago">MercadoPago</option>
            </select>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Cliente</h3>
        <div className="grid-2">
          <div className="field">
            <label>Cliente del CRM (opcional)</label>
            <select name="clientId" defaultValue={booking.clientId ?? ""}>
              <option value="">— Sin vincular —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Nombre del cliente</label>
            <input name="clientName" defaultValue={booking.clientName} />
            <FieldError name="clientName" errors={state.fieldErrors} />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="clientEmail" type="email" defaultValue={booking.clientEmail ?? ""} autoComplete="off" />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input name="clientPhone" defaultValue={booking.clientPhone ?? ""} />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input name="clientWhatsapp" defaultValue={booking.clientWhatsapp ?? ""} placeholder="521..." />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Paquete y evento</h3>
        <div className="grid-2">
          <div className="field">
            <label>Paquete</label>
            <select name="packageId" defaultValue={booking.packageId ?? ""}>
              <option value="">— Custom / sin paquete —</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tipo de evento</label>
            <input name="venueType" defaultValue={booking.venueType ?? ""} placeholder="boda, corporativo, cumpleaños..." />
          </div>
          <div className="field">
            <label>Invitados</label>
            <input name="guestCount" type="number" min={0} step="1" defaultValue={booking.guestCount ?? ""} />
          </div>
          <div className="field">
            <label>Fecha</label>
            <input name="requestedDate" type="date" defaultValue={booking.requestedDateISO ?? ""} />
          </div>
          <div className="field">
            <label>Hora inicio</label>
            <input name="startTime" type="time" defaultValue={booking.startTime ?? ""} />
          </div>
          <div className="field">
            <label>Hora fin</label>
            <input name="endTime" type="time" defaultValue={booking.endTime ?? ""} />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Ubicación</h3>
        <div className="field">
          <label>Dirección</label>
          <input name="address" defaultValue={booking.address ?? ""} />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Ciudad</label>
            <input name="city" defaultValue={booking.city ?? ""} />
          </div>
          <div className="field">
            <label>Estado</label>
            <input name="state" defaultValue={booking.state ?? ""} />
          </div>
        </div>
        <div className="field">
          <label>Maps link</label>
          <input name="mapsLink" defaultValue={booking.mapsLink ?? ""} placeholder="https://maps.app.goo.gl/..." />
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Montos</h3>
        <div className="grid-2">
          <div className="field">
            <label>Monto base</label>
            <input name="baseAmount" type="number" min={0} step="0.01" defaultValue={booking.baseAmountUnits} />
          </div>
          <div className="field">
            <label>Anticipo</label>
            <input name="depositAmount" type="number" min={0} step="0.01" defaultValue={booking.depositAmountUnits} />
          </div>
        </div>
      </section>

      <div className="field">
        <label>Notas internas</label>
        <textarea name="adminNote" defaultValue={booking.adminNote ?? ""} />
      </div>

      <div>
        <Submit />
      </div>
    </form>
  )
}
