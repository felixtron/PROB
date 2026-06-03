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

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type CotizarPageProps = {
  searchParams: Promise<{ package?: string }>
}

export default async function CotizarPage({ searchParams }: CotizarPageProps) {
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

  // Match ?package=<slug> against the slugified package name so deep-links from
  // the landing CTAs land on the right format pre-selected in Step 1.
  const { package: pkgSlug } = await searchParams
  let initialPackageId: string | undefined
  if (pkgSlug) {
    const wanted = pkgSlug.toLowerCase()
    const match = packages.find((p) => slugify(p.name) === wanted)
    if (match) initialPackageId = match.id
  }

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

      <FunnelWizard packages={packages} initialPackageId={initialPackageId} />
    </div>
  )
}
