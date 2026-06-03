"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateBankAction, type BankActionState } from "@/app/admin/bank/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const initial: BankActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? "Guardando..." : "Guardar"}
    </Button>
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
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-5">
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
          <Label htmlFor="bankName">Banco</Label>
          <Input id="bankName" name="bankName" defaultValue={initialState.bankName} placeholder="BBVA" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="beneficiary">Beneficiario</Label>
          <Input id="beneficiary" name="beneficiary" defaultValue={initialState.beneficiary} placeholder="Nombre completo" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="account">Cuenta</Label>
          <Input id="account" name="account" defaultValue={initialState.account} placeholder="1234 5678 9012 3456" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clabe">CLABE</Label>
          <Input id="clabe" name="clabe" defaultValue={initialState.clabe} placeholder="012 345 67890123456 7" />
        </div>
      </div>

      <div>
        <Submit />
      </div>
    </form>
  )
}
