import Link from "next/link"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ManualBookingForm } from "@/components/admin/ManualBookingForm"

export const dynamic = "force-dynamic"

export default async function ManualBookingPage() {
  const tenant = await resolveCurrentTenant()
  const [clients, packages] = await Promise.all([
    db.clientProfile.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.servicePackage.findMany({
      where: { tenantId: tenant.id, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <Link href="/admin/ventas" className="muted" style={{ textDecoration: "none", fontSize: 13 }}>
          ← Centro de Ventas
        </Link>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Nueva cotización manual</h1>
        <p className="muted" style={{ margin: 0 }}>
          Crea una cotización a mano (cliente que llega por teléfono, WhatsApp o referido). Las del funnel
          público llegan auto a Centro de Ventas cuando habilitemos `/cotizar` en Fase 3d.
        </p>
      </div>

      <ManualBookingForm clients={clients} packages={packages} />
    </div>
  )
}
