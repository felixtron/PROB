"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createProviderAction,
  updateProviderAction,
  deleteProviderAction,
  type ProviderActionState,
} from "@/app/admin/proveedores/actions"

const initial: ProviderActionState = { ok: false }

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? pendingLabel : label}
    </button>
  )
}

function DangerSubmit() {
  const { pending } = useFormStatus()
  return (
    <button
      className="button secondary"
      disabled={pending}
      type="submit"
      style={{ color: "#fb7185", borderColor: "rgba(251,113,133,0.4)" }}
    >
      {pending ? "..." : "Eliminar"}
    </button>
  )
}

export type ProviderInitialValues = {
  id?: string
  name: string
  category: string
  contactName: string
  email: string
  phone: string
  whatsapp: string
  city: string
  baseRate: number | ""
  currency: string
  notes: string
  active: boolean
}

const CATEGORY_OPTIONS = [
  "Sonido",
  "Iluminación",
  "Foto",
  "Video",
  "Tarima/Backline",
  "Transporte",
  "Decoración",
  "Catering",
  "Seguridad",
  "Coordinación",
  "Otro",
]

export function ProviderForm({
  initialValues,
  mode,
  tenantCurrency,
}: {
  initialValues: ProviderInitialValues
  mode: "create" | "edit"
  tenantCurrency: string
}) {
  const action = mode === "create" ? createProviderAction : updateProviderAction
  const [state, formAction] = useActionState(action, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 18, display: "grid", gap: 12 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Nombre del proveedor</label>
          <input name="name" defaultValue={initialValues.name} placeholder="Audio Pro CDMX" />
        </div>
        <div className="field">
          <label>Categoría</label>
          <select name="category" defaultValue={initialValues.category}>
            <option value="">Selecciona...</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Persona de contacto</label>
          <input name="contactName" defaultValue={initialValues.contactName} placeholder="Juan Pérez" />
        </div>
        <div className="field">
          <label>Ciudad</label>
          <input name="city" defaultValue={initialValues.city} placeholder="CDMX, Guadalajara..." />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Teléfono</label>
          <input name="phone" defaultValue={initialValues.phone} />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input name="whatsapp" defaultValue={initialValues.whatsapp} placeholder="+52 55..." />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" defaultValue={initialValues.email} />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Tarifa base</label>
          <input
            name="baseRate"
            type="number"
            min={0}
            step={1}
            defaultValue={initialValues.baseRate === "" ? "" : initialValues.baseRate}
            placeholder="0"
          />
        </div>
        <div className="field">
          <label>Moneda</label>
          <input name="currency" defaultValue={initialValues.currency || tenantCurrency} placeholder={tenantCurrency} />
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              name="active"
              type="checkbox"
              defaultChecked={initialValues.active}
              style={{ width: "auto" }}
            />
            <span>Activo</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label>Notas internas</label>
        <textarea
          name="notes"
          defaultValue={initialValues.notes}
          placeholder="Condiciones, tiempos de entrega, casos en que conviene contratarlo..."
        />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Agregar proveedor" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Agregando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deleteProviderAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
