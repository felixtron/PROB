import { z } from "zod"
import { sanitizeHtml } from "./sanitize"

const optionalUrl = z.string().trim().url("URL inválida").or(z.literal("")).optional()

// Password must be:
// - At least 12 characters
// - Contain uppercase letter
// - Contain lowercase letter
// - Contain digit
// - Contain special character
const strongPassword = z
  .string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula (A-Z)")
  .regex(/[a-z]/, "Debe incluir al menos una minúscula (a-z)")
  .regex(/[0-9]/, "Debe incluir al menos un número (0-9)")
  .regex(/[@$!%*?&]/, "Debe incluir al menos un carácter especial (@$!%*?&)")

// Name validation: alphanumeric + allowed symbols
const namePattern = /^[a-zA-Z0-9\s\-.,´'()&]+$/
const nameValidation = z.string().regex(namePattern, "Contiene caracteres no permitidos")

// Text field with HTML sanitization
const sanitizedText = (maxLength: number) =>
  z.string()
    .trim()
    .max(maxLength)
    .transform((val) => sanitizeHtml(val))
    .or(z.literal(""))
    .optional()

export const installSchema = z.object({
  organizationName: z.string().trim().min(2, "El nombre es obligatorio").pipe(nameValidation),
  projectType: z.string().trim().min(2, "Selecciona el tipo de proyecto"),
  shortDescription: sanitizedText(180),
  longDescription: sanitizedText(2000),
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
  adminName: z.string().trim().min(2, "Nombre de admin requerido").pipe(nameValidation),
  adminEmail: z.string().trim().email("Email de admin inválido"),
  adminPassword: strongPassword,
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
