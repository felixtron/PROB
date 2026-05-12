"use server"

import { redirect } from "next/navigation"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { isInstalled } from "@/lib/install"
import { installSchema } from "@/lib/install-schema"
import { defaultMessageTemplates, getPackagePreset } from "@/lib/install-presets"

export type InstallActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string[]>
}

export async function runInstallAction(_: InstallActionState, formData: FormData): Promise<InstallActionState> {
  if (await isInstalled()) {
    redirect("/admin")
  }

  const raw = Object.fromEntries(formData.entries())
  const parsed = installSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = parsed.data
  const socialLinks = {
    instagram: data.instagramUrl || null,
    facebook: data.facebookUrl || null,
    tiktok: data.tiktokUrl || null,
    youtube: data.youtubeUrl || null,
    spotify: data.spotifyUrl || null,
  }

  const packagePreset = getPackagePreset(data.packagePreset)

  await db.$transaction(async (tx) => {
    const existingAdmin = await tx.user.findUnique({ where: { email: data.adminEmail } })
    if (existingAdmin) throw new Error("Ya existe un usuario con ese email.")

    await tx.organization.upsert({
      where: { id: "singleton" },
      update: {
        name: data.organizationName,
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
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        socialLinksJson: JSON.stringify(socialLinks),
      },
      create: {
        id: "singleton",
        name: data.organizationName,
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
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        socialLinksJson: JSON.stringify(socialLinks),
      },
    })

    await tx.user.create({
      data: {
        name: data.adminName,
        email: data.adminEmail,
        password: await hash(data.adminPassword, 12),
        role: "ADMIN",
      },
    })

    await tx.bankSettings.upsert({
      where: { id: "singleton" },
      update: {
        bankName: data.bankName || null,
        account: data.bankAccount || null,
        clabe: data.bankClabe || null,
        beneficiary: data.bankBeneficiary || null,
      },
      create: {
        id: "singleton",
        bankName: data.bankName || null,
        account: data.bankAccount || null,
        clabe: data.bankClabe || null,
        beneficiary: data.bankBeneficiary || null,
      },
    })

    await tx.integrationSettings.upsert({
      where: { id: "singleton" },
      update: {
        stripeEnabled: Boolean(data.stripePublishableKeyHint),
        stripePublishableKeyHint: data.stripePublishableKeyHint || null,
        evolutionEnabled: Boolean(data.evolutionBaseUrl && data.evolutionInstance),
        evolutionBaseUrl: data.evolutionBaseUrl || null,
        evolutionInstance: data.evolutionInstance || null,
        googleCalendarEnabled: Boolean(data.googleCalendarId),
        googleCalendarId: data.googleCalendarId || null,
      },
      create: {
        id: "singleton",
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
          name: pack.name,
          description: pack.description,
          basePrice: pack.basePrice,
          minDuration: pack.minDuration,
          includesJson: JSON.stringify(pack.includes),
        },
      })
    }

    for (const template of defaultMessageTemplates) {
      await tx.messageTemplate.upsert({
        where: { key: template.key },
        update: template,
        create: template,
      })
    }

    await tx.installationState.upsert({
      where: { id: "singleton" },
      update: { completed: true, completedAt: new Date() },
      create: { id: "singleton", completed: true, completedAt: new Date() },
    })
  })

  redirect("/admin")
}
