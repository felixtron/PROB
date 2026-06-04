"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { PenTool } from "lucide-react"
import { signAdminAction, type ContractActionState } from "@/app/admin/ventas/[id]/contrato/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const initial: ContractActionState = { ok: false }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-1.5 h-10 px-5 font-bold">
      <PenTool className="w-3.5 h-3.5" />
      {pending ? "Firmando..." : "Firmar como prestador"}
    </Button>
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
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-4">
      <input type="hidden" name="contractId" value={contractId} />
      <input type="hidden" name="bookingId" value={bookingId} />
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
      <p className="text-muted-foreground text-sm m-0">
        Confirma tu nombre como representante legal y firma. Queda registrado con timestamp.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="signerName">Nombre del firmante</Label>
        <Input id="signerName" name="signerName" defaultValue={defaultName} placeholder="Nombre completo" />
      </div>
      <Submit />
    </form>
  )
}
