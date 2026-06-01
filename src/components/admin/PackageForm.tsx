"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  createPackageAction,
  updatePackageAction,
  deletePackageAction,
  type PackageActionState,
} from "@/app/admin/packages/actions"

const initial: PackageActionState = { ok: false }

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

export type PackageInitialValues = {
  id?: string
  name: string
  description: string
  basePrice: number
  minDuration: number
  includes: string
  active: boolean
}

export function PackageForm({
  initialValues,
  mode,
}: {
  initialValues: PackageInitialValues
  mode: "create" | "edit"
}) {
  const action = mode === "create" ? createPackageAction : updatePackageAction
  const [state, formAction] = useActionState(action, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
      {mode === "edit" ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Nombre</label>
          <input name="name" defaultValue={initialValues.name} />
        </div>
        <div className="field">
          <label>Precio base</label>
          <input name="basePrice" type="number" min={0} step="0.01" defaultValue={initialValues.basePrice} />
        </div>
        <div className="field">
          <label>Duración mínima (horas)</label>
          <input name="minDuration" type="number" min={0} step="1" defaultValue={initialValues.minDuration} />
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              name="active"
              type="checkbox"
              defaultChecked={initialValues.active}
              style={{ width: "auto" }}
            />
            <span>Activo (visible para clientes)</span>
          </label>
        </div>
      </div>
      <div className="field">
        <label>Descripción</label>
        <textarea name="description" defaultValue={initialValues.description} />
      </div>
      <div className="field">
        <label>Incluye (una línea por item)</label>
        <textarea
          name="includes"
          defaultValue={initialValues.includes}
          placeholder={"Sonido profesional\nLuces básicas\n4 horas de show"}
        />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Submit
          label={mode === "create" ? "Crear paquete" : "Guardar cambios"}
          pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        />
        {mode === "edit" ? (
          <form action={deletePackageAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={initialValues.id} />
            <DangerSubmit />
          </form>
        ) : null}
      </div>
    </form>
  )
}
