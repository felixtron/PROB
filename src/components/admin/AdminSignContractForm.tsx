"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signAdminAction, type ContractActionState } from "@/app/admin/ventas/[id]/contrato/actions"

const initial: ContractActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Firmando..." : "Firmar como prestador"}
    </button>
  )
}

export function AdminSignContractForm({
  contractId,
  bookingId,
  defaultName,
}: {
  contractId: string
  bookingId: string
  defaultName: string
}) {
  const [state, formAction] = useActionState(signAdminAction, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 18, display: "grid", gap: 12 }}>
      <input type="hidden" name="contractId" value={contractId} />
      <input type="hidden" name="bookingId" value={bookingId} />
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>
        Confirma tu nombre como representante legal y firma. Queda registrado con timestamp.
      </p>
      <div className="field">
        <label>Nombre del firmante</label>
        <input name="signerName" defaultValue={defaultName} placeholder="Nombre completo" />
      </div>
      <Submit />
    </form>
  )
}
