import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { FunnelWizard } from "@/components/funnel/FunnelWizard"

export const dynamic = "force-dynamic"

function parseIncludes(raw: string): string[] {
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

export default async function CotizarPage() {
  const tenant = await resolveCurrentTenant()
  const rawPackages = await db.servicePackage.findMany({
    where: { tenantId: tenant.id, active: true },
    orderBy: { basePrice: "asc" },
  })

  const packages = rawPackages.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    includes: parseIncludes(p.includesJson),
  }))

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <p
          className="muted"
          style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.18em", margin: 0, fontSize: 11 }}
        >
          Cotización en línea
        </p>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 44,
            margin: "12px 0 14px",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          Hagamos único tu evento.
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
          Cuéntanos del evento en 4 pasos cortos. Recibirás un código único y nos pondremos en contacto contigo en menos
          de 24 horas con la cotización personalizada.
        </p>
      </div>

      <FunnelWizard packages={packages} />
    </div>
  )
}
