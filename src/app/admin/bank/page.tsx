import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { BankSettingsForm } from "@/components/admin/BankSettingsForm"

export const dynamic = "force-dynamic"

export default async function BankPage() {
  const tenant = await resolveCurrentTenant()
  const settings = await db.bankSettings.findUnique({ where: { tenantId: tenant.id } })

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Banco</h1>
        <p className="muted" style={{ margin: 0 }}>
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
