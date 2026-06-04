import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ManualBookingForm } from "@/components/admin/ManualBookingForm"
import { Button } from "@/components/ui/button"

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
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <Link href="/admin/ventas" className="no-underline inline-block mb-4">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Centro de Ventas
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Nueva cotización manual</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Crea una cotización a mano (cliente que llega por teléfono, WhatsApp o referido). Las del funnel
          público llegan auto a Centro de Ventas cuando habilitemos <code className="px-1 py-0.5 rounded bg-muted text-xs">/cotizar</code>.
        </p>
      </div>

      <ManualBookingForm clients={clients} packages={packages} />
    </div>
  )
}
