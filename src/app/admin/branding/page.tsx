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
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Branding</h1>
        <p className="muted" style={{ margin: 0 }}>
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
