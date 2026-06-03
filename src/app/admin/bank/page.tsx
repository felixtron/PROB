import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { BankSettingsForm } from "@/components/admin/BankSettingsForm"

export const dynamic = "force-dynamic"

export default async function BankPage() {
  const tenant = await resolveCurrentTenant()
  const settings = await db.bankSettings.findUnique({ where: { tenantId: tenant.id } })

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Banco</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Datos bancarios para depósitos manuales. Se muestran al cliente cuando elige pago por transferencia.
        </p>
      </div>

      <BankSettingsForm
        initialState={{
          bankName: settings?.bankName ?? "",
          account: settings?.account ?? "",
          clabe: settings?.clabe ?? "",
          beneficiary: settings?.beneficiary ?? "",
        }}
      />
    </div>
  )
}
