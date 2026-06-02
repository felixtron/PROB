"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { resolveTenantIdForAdminAction } from "@/lib/admin-helpers"

export type BrandingActionState = { ok: boolean; message?: string; fieldErrors?: Record<string, string[]> }

const optionalStr = z.string().trim().optional().or(z.literal(""))
const optionalUrl = z.string().trim().url("URL inválida").or(z.literal("")).optional()

const brandingSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido"),
  projectType: z.string().trim().min(2, "Tipo de proyecto requerido"),
  shortDescription: z.string().trim().max(180).optional().or(z.literal("")),
  longDescription: z.string().trim().max(2000).optional().or(z.literal("")),
  city: optionalStr,
  state: optionalStr,
  country: z.string().trim().default("México"),
  phone: optionalStr,
  whatsapp: optionalStr,
  email: z.string().trim().email("Email inválido").or(z.literal("")).optional(),
  website: optionalUrl,
  currency: z.string().trim().min(3).max(3),
  timezone: z.string().trim().min(3),
  logoUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color primario inválido"),
  secondaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color secundario inválido"),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  spotifyUrl: optionalUrl,
  legalName: optionalStr,
  legalRfc: optionalStr,
  contractLegalText: z.string().trim().max(20000).optional().or(z.literal("")),
})

export async function updateBrandingAction(
  _state: BrandingActionState,
  formData: FormData,
): Promise<BrandingActionState> {
  const tenantId = await resolveTenantIdForAdminAction()
  const parsed = brandingSchema.safeParse(Object.fromEntries(formData.entries()))
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

  await db.tenant.update({
    where: { id: tenantId },
    data: {
      name: data.name,
      projectType: data.projectType,
      shortDescription: data.shortDescription || null,
      longDescription: data.longDescription || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      website: data.website || null,
      currency: data.currency.toUpperCase(),
      timezone: data.timezone,
      logoUrl: data.logoUrl || null,
      heroImageUrl: data.heroImageUrl || null,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      socialLinksJson: JSON.stringify(socialLinks),
      legalName: data.legalName || null,
      legalRfc: data.legalRfc || null,
      contractLegalText: data.contractLegalText || null,
    },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/branding")
  return { ok: true, message: "Branding actualizado." }
}
