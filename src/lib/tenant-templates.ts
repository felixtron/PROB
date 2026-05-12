import { db } from "@/lib/db"
import { defaultMessageTemplates, getPackagePreset } from "@/lib/install-presets"

const defaultTemplates = [
  {
    key: "band",
    name: "Banda",
    description: "Proyecto musical con paquetes de show completo y premium.",
    defaultProjectType: "band",
    defaultPrimaryColor: "#e11d48",
    defaultSecondaryColor: "#111827",
    packagePreset: "band" as const,
  },
  {
    key: "dj",
    name: "DJ",
    description: "Proyecto de DJ para eventos sociales y corporativos.",
    defaultProjectType: "dj",
    defaultPrimaryColor: "#0ea5e9",
    defaultSecondaryColor: "#111827",
    packagePreset: "dj" as const,
  },
  {
    key: "artist",
    name: "Artista solista",
    description: "Show de artista con formato íntimo o personalizado.",
    defaultProjectType: "artist",
    defaultPrimaryColor: "#f97316",
    defaultSecondaryColor: "#111827",
    packagePreset: "artist" as const,
  },
  {
    key: "agency",
    name: "Agencia / Producción",
    description: "Plantilla para producción, talento y cotizaciones por alcance.",
    defaultProjectType: "agency",
    defaultPrimaryColor: "#22c55e",
    defaultSecondaryColor: "#111827",
    packagePreset: "agency" as const,
  },
]

export async function ensureDefaultTenantTemplates() {
  for (const template of defaultTemplates) {
    const existing = await db.tenantTemplate.findUnique({ where: { key: template.key } })
    if (existing) continue

    await db.tenantTemplate.create({
      data: {
        key: template.key,
        name: template.name,
        description: template.description,
        defaultProjectType: template.defaultProjectType,
        defaultPrimaryColor: template.defaultPrimaryColor,
        defaultSecondaryColor: template.defaultSecondaryColor,
        defaultFeaturesJson: JSON.stringify({ quotes: true, whatsapp: true, stripeConnect: true }),
        packages: {
          create: getPackagePreset(template.packagePreset).map((pack) => ({
            name: pack.name,
            description: pack.description,
            basePrice: pack.basePrice,
            minDuration: pack.minDuration,
            includesJson: JSON.stringify(pack.includes),
          })),
        },
        messages: {
          create: defaultMessageTemplates.map((message) => ({ ...message })),
        },
      },
    })
  }
}

export async function getActiveTenantTemplates() {
  await ensureDefaultTenantTemplates()

  return db.tenantTemplate.findMany({
    where: { active: true },
    include: {
      packages: { orderBy: { basePrice: "asc" } },
      messages: { orderBy: { key: "asc" } },
    },
    orderBy: { name: "asc" },
  })
}
