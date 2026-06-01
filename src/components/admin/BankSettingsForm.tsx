"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateBankAction, type BankActionState } from "@/app/admin/bank/actions"

const initial: BankActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Guardando..." : "Guardar"}
    </button>
  )
}

export type BankSettingsFormProps = {
  initialState: {
    bankName: string
    account: string
    clabe: string
    beneficiary: string
  }
}

export function BankSettingsForm({ initialState }: BankSettingsFormProps) {
  const [state, formAction] = useActionState(updateBankAction, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Banco</label>
          <input name="bankName" defaultValue={initialState.bankName} placeholder="BBVA" />
        </div>
        <div className="field">
          <label>Beneficiario</label>
          <input name="beneficiary" defaultValue={initialState.beneficiary} placeholder="Nombre completo" />
        </div>
        <div className="field">
          <label>Cuenta</label>
          <input name="account" defaultValue={initialState.account} placeholder="1234 5678 9012 3456" />
        </div>
        <div className="field">
          <label>CLABE</label>
          <input name="clabe" defaultValue={initialState.clabe} placeholder="012 345 67890123456 7" />
        </div>
      </div>

      <div>
        <Submit />
      </div>
    </form>
  )
}
