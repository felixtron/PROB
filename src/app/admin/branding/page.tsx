import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { BrandingForm } from "@/components/admin/BrandingForm"

export const dynamic = "force-dynamic"

type SocialLinks = Partial<Record<"instagram" | "facebook" | "tiktok" | "youtube" | "spotify", string | null>>

function parseSocialLinks(raw: string): SocialLinks {
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === "object" && parsed !== null ? (parsed as SocialLinks) : {}
  } catch {
    return {}
  }
}

export default async function BrandingPage() {
  const tenant = await resolveCurrentTenant()
  const social = parseSocialLinks(tenant.socialLinksJson)

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Branding</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Datos del proyecto. Slug y dominio principal se administran aparte porque cambiarlos rompe URLs activas.
        </p>
      </div>

      <BrandingForm
        initialState={{
          name: tenant.name,
          projectType: tenant.projectType,
          shortDescription: tenant.shortDescription ?? "",
          longDescription: tenant.longDescription ?? "",
          city: tenant.city ?? "",
          state: tenant.state ?? "",
          country: tenant.country ?? "México",
          phone: tenant.phone ?? "",
          whatsapp: tenant.whatsapp ?? "",
          email: tenant.email ?? "",
          website: tenant.website ?? "",
          currency: tenant.currency,
          timezone: tenant.timezone,
          logoUrl: tenant.logoUrl ?? "",
          heroImageUrl: tenant.heroImageUrl ?? "",
          primaryColor: tenant.primaryColor,
          secondaryColor: tenant.secondaryColor,
          instagramUrl: social.instagram ?? "",
          facebookUrl: social.facebook ?? "",
          tiktokUrl: social.tiktok ?? "",
          youtubeUrl: social.youtube ?? "",
          spotifyUrl: social.spotify ?? "",
          legalName: tenant.legalName ?? "",
          legalRfc: tenant.legalRfc ?? "",
          contractLegalText: tenant.contractLegalText ?? "",
        }}
        readOnly={{
          slug: tenant.slug,
          primaryDomain: tenant.primaryDomain,
          status: tenant.status,
        }}
      />
    </div>
  )
}
