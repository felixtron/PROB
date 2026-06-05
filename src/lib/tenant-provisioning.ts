import { hash } from "bcryptjs"
import type { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { defaultMessageTemplates, getPackagePreset } from "@/lib/install-presets"
import type { InstallInput } from "@/lib/install-schema"
import { getPlatformHostname } from "@/lib/tenant-routing"
import { slugifyTenantName } from "@/lib/tenant"

type ProvisionTenantInput = InstallInput & {
  templateId?: string
}

type SeedPackage = {
  name: string
  description: string | null
  basePrice: number
  minDuration: number
  includesJson: string
}

type SeedMessage = {
  key: string
  label: string
  content: string
}

async function buildUniqueSlug(tx: Prisma.TransactionClient, name: string) {
  const baseSlug = slugifyTenantName(name)
  let slug = baseSlug
  let suffix = 2
  
  // Instead of looping queries, check once and use a loop only if there's a conflict
  const existingWithBase = await tx.tenant.findUnique({ where: { slug: baseSlug } })
  
  if (!existingWithBase) {
    return baseSlug
  }

  // Only loop if the base slug already exists
  while (true) {
    const candidate = `${baseSlug}-${suffix}`
    const existing = await tx.tenant.findUnique({ where: { slug: candidate } })
    
    if (!existing) {
      return candidate
    }
    
    suffix += 1
  }
}

/**
 * Internal function that does the actual provisioning.
 * Must be called within a Prisma transaction.
 */
async function _doProvisionTenant(
  tx: Prisma.TransactionClient,
  data: ProvisionTenantInput
) {
  const socialLinks = {
    instagram: data.instagramUrl || null,
    facebook: data.facebookUrl || null,
    tiktok: data.tiktokUrl || null,
    youtube: data.youtubeUrl || null,
    spotify: data.spotifyUrl || null,
  }

  const template = data.templateId
    ? await tx.tenantTemplate.findUnique({
        where: { id: data.templateId },
        include: { packages: true, messages: true },
      })
    : null

  const packagePreset: SeedPackage[] = template
    ? template.packages.map((pack) => ({
        name: pack.name,
        description: pack.description,
        basePrice: pack.basePrice,
        minDuration: pack.minDuration,
        includesJson: pack.includesJson,
      }))
    : getPackagePreset(data.packagePreset).map((pack) => ({
        name: pack.name,
        description: pack.description,
        basePrice: pack.basePrice,
        minDuration: pack.minDuration,
        includesJson: JSON.stringify(pack.includes),
      }))

  const messagePreset: SeedMessage[] = template
    ? template.messages.map((message) => ({
        key: message.key,
        label: message.label,
        content: message.content,
      }))
    : defaultMessageTemplates

  const job = await tx.tenantProvisioningJob.create({
    data: {
      templateId: template?.id,
      status: "RUNNING",
      inputJson: JSON.stringify({
        organizationName: data.organizationName,
        adminEmail: data.adminEmail,
        templateId: data.templateId ?? null,
      }),
      startedAt: new Date(),
    },
  })

  const existingAdmin = await tx.user.findUnique({ where: { email: data.adminEmail } })
  if (existingAdmin) throw new Error("Ya existe un usuario con ese email.")

  const tenantSlug = await buildUniqueSlug(tx, data.organizationName)
  const platformHostname = getPlatformHostname()
  const platformDomain = platformHostname ? `${tenantSlug}.${platformHostname}` : null

  const tenant = await tx.tenant.create({
    data: {
      name: data.organizationName,
      slug: tenantSlug,
      primaryDomain: platformDomain,
      projectType: data.projectType,
      shortDescription: data.shortDescription || null,
      longDescription: data.longDescription || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email,
      website: data.website || null,
      currency: data.currency,
      timezone: data.timezone,
      logoUrl: data.logoUrl || null,
      heroImageUrl: data.heroImageUrl || null,
      primaryColor: template?.defaultPrimaryColor ?? data.primaryColor,
      secondaryColor: template?.defaultSecondaryColor ?? data.secondaryColor,
      socialLinksJson: JSON.stringify(socialLinks),
      featureFlagsJson: template?.defaultFeaturesJson ?? "{}",
      domains: platformDomain
        ? {
            create: {
              hostname: platformDomain,
              type: "PLATFORM_SUBDOMAIN",
              status: "ACTIVE",
              verificationToken: crypto.randomUUID(),
              verifiedAt: new Date(),
            },
          }
        : undefined,
    },
  })

  await tx.user.create({
    data: {
      tenantId: tenant.id,
      name: data.adminName,
      email: data.adminEmail,
      password: await hash(data.adminPassword, 12),
      role: "TENANT_ADMIN",
    },
  })

  await tx.bankSettings.create({
    data: {
      tenantId: tenant.id,
      bankName: data.bankName || null,
      account: data.bankAccount || null,
      clabe: data.bankClabe || null,
      beneficiary: data.bankBeneficiary || null,
    },
  })

  await tx.integrationSettings.create({
    data: {
      tenantId: tenant.id,
      stripeEnabled: Boolean(data.stripePublishableKeyHint),
      stripePublishableKeyHint: data.stripePublishableKeyHint || null,
      evolutionEnabled: Boolean(data.evolutionBaseUrl && data.evolutionInstance),
      evolutionBaseUrl: data.evolutionBaseUrl || null,
      evolutionInstance: data.evolutionInstance || null,
      googleCalendarEnabled: Boolean(data.googleCalendarId),
      googleCalendarId: data.googleCalendarId || null,
    },
  })

  for (const pack of packagePreset) {
    await tx.servicePackage.create({
      data: {
        tenantId: tenant.id,
        name: pack.name,
        description: pack.description,
        basePrice: pack.basePrice,
        minDuration: pack.minDuration,
        includesJson: pack.includesJson,
      },
    })
  }

  for (const templateMessage of messagePreset) {
    await tx.messageTemplate.create({
      data: { ...templateMessage, tenantId: tenant.id },
    })
  }

  await tx.tenantProvisioningJob.update({
    where: { id: job.id },
    data: {
      tenantId: tenant.id,
      status: "COMPLETED",
      summary: `Tenant ${tenant.name} creado con ${packagePreset.length} paquetes y ${messagePreset.length} mensajes.`,
      completedAt: new Date(),
    },
  })

  return tenant
}

/**
 * Public function to provision a new tenant.
 * Can be called standalone or within a transaction context.
 */
export async function provisionTenant(
  data: ProvisionTenantInput,
  tx?: Prisma.TransactionClient
) {
  if (tx) {
    // Called within a transaction, use the provided context
    return _doProvisionTenant(tx, data)
  } else {
    // Standalone call, wrap in transaction
    return db.$transaction((txClient) => _doProvisionTenant(txClient, data))
  }
}
