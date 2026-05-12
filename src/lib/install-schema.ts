import { z } from "zod"

const optionalUrl = z.string().trim().url("URL inválida").or(z.literal("")).optional()

export const installSchema = z.object({
  organizationName: z.string().trim().min(2, "El nombre es obligatorio"),
  projectType: z.string().trim().min(2, "Selecciona el tipo de proyecto"),
  shortDescription: z.string().trim().max(180).optional().or(z.literal("")),
  longDescription: z.string().trim().max(2000).optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().default("México"),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido"),
  website: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  spotifyUrl: optionalUrl,
  logoUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color primario inválido"),
  secondaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color secundario inválido"),
  currency: z.string().trim().min(3).max(3).default("MXN"),
  timezone: z.string().trim().min(3).default("America/Mexico_City"),
  adminName: z.string().trim().min(2, "Nombre de admin requerido"),
  adminEmail: z.string().trim().email("Email de admin inválido"),
  adminPassword: z.string().min(10, "La contraseña debe tener al menos 10 caracteres"),
  packagePreset: z.enum(["band", "dj", "artist", "agency", "blank"]).default("band"),
  bankName: z.string().trim().optional().or(z.literal("")),
  bankAccount: z.string().trim().optional().or(z.literal("")),
  bankClabe: z.string().trim().optional().or(z.literal("")),
  bankBeneficiary: z.string().trim().optional().or(z.literal("")),
  stripePublishableKeyHint: z.string().trim().optional().or(z.literal("")),
  evolutionBaseUrl: optionalUrl,
  evolutionInstance: z.string().trim().optional().or(z.literal("")),
  googleCalendarId: z.string().trim().optional().or(z.literal("")),
})

export type InstallInput = z.infer<typeof installSchema>
