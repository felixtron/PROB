"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createBookingAction, type BookingActionState } from "@/app/admin/ventas/actions"

const initial: BookingActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Creando..." : "Crear cotización / booking"}
    </button>
  )
}

function FieldError({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  const msg = errors?.[name]?.[0]
  if (!msg) return null
  return <span style={{ color: "#fb7185", fontSize: 12 }}>{msg}</span>
}

export type ManualBookingFormProps = {
  clients: { id: string; name: string }[]
  packages: { id: string; name: string }[]
}

export function ManualBookingForm({ clients, packages }: ManualBookingFormProps) {
  const [state, formAction] = useActionState(createBookingAction, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 18 }}>
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Cliente</h3>
        <div className="grid-2">
          <div className="field">
            <label>Cliente existente (opcional)</label>
            <select name="clientId" defaultValue="">
              <option value="">— Nuevo cliente, datos abajo —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Nombre del cliente</label>
            <input name="clientName" placeholder="Si seleccionaste arriba, repite aquí" />
            <FieldError name="clientName" errors={state.fieldErrors} />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="clientEmail" type="email" autoComplete="off" />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input name="clientPhone" />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input name="clientWhatsapp" placeholder="521..." />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Paquete y evento</h3>
        <div className="grid-2">
          <div className="field">
            <label>Paquete</label>
            <select name="packageId" defaultValue="">
              <option value="">— Custom / sin paquete —</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tipo de evento</label>
            <input name="venueType" placeholder="boda, corporativo, cumpleaños..." />
          </div>
          <div className="field">
            <label>Invitados aproximados</label>
            <input name="guestCount" type="number" min={0} step="1" />
          </div>
          <div className="field">
            <label>Fecha</label>
            <input name="requestedDate" type="date" />
          </div>
          <div className="field">
            <label>Hora inicio</label>
            <input name="startTime" type="time" />
          </div>
          <div className="field">
            <label>Hora fin</label>
            <input name="endTime" type="time" />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Ubicación</h3>
        <div className="field">
          <label>Dirección</label>
          <input name="address" placeholder="Calle, número, colonia..." />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Ciudad</label>
            <input name="city" />
          </div>
          <div className="field">
            <label>Estado</label>
            <input name="state" />
          </div>
        </div>
        <div className="field">
          <label>Maps link</label>
          <input name="mapsLink" placeholder="https://maps.app.goo.gl/..." />
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Cobro</h3>
        <div className="grid-3">
          <div className="field">
            <label>Monto base</label>
            <input name="baseAmount" type="number" min={0} step="0.01" placeholder="0.00" />
          </div>
          <div className="field">
            <label>Anticipo</label>
            <input name="depositAmount" type="number" min={0} step="0.01" placeholder="0.00" />
          </div>
          <div className="field">
            <label>Método</label>
            <select name="paymentMethod" defaultValue="">
              <option value="">— ninguno aún —</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="stripe">Stripe</option>
              <option value="mercadopago">MercadoPago</option>
            </select>
          </div>
        </div>
      </section>

      <div className="field">
        <label>Notas internas</label>
        <textarea name="adminNote" placeholder="Detalles para el equipo, requisitos especiales..." />
      </div>

      <div>
        <Submit />
      </div>
    </form>
  )
}
