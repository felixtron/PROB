import type { Metadata } from "next"
import Script from "next/script"
import { redirect } from "next/navigation"
import { isManaged } from "@/lib/platform-mode"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { db } from "@/lib/db"
import { LandingPage } from "@/components/landing/LandingPage"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: new URL("https://priscastromusic.com"),
  title: {
    default: "Priscilla Castro | Música en Vivo para Eventos",
    template: "%s | Priscilla Castro",
  },
  description:
    "Tu evento debe sonar tan hermoso como se ve. R&B, soul, jazz y pop en formatos íntimos y premium para bodas, corporativos y celebraciones exclusivas.",
  keywords: [
    "Priscilla Castro cantante",
    "cantante de jazz CDMX",
    "música para bodas de lujo México",
    "cantante soul para eventos corporativos",
    "jazz en vivo CDMX",
    "contratar música premium",
    "entretenimiento musical para bodas",
    "voz para eventos exclusivos",
    "jazz vintage premium",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/monogram.png", type: "image/png", sizes: "any" }],
    apple: "/monogram.png",
    shortcut: "/monogram.png",
  },
  openGraph: {
    title: "Priscilla Castro | Música en Vivo para Eventos",
    description:
      "Tu evento debe sonar tan hermoso como se ve. R&B, soul, jazz y pop en formatos íntimos y premium para bodas, corporativos y celebraciones exclusivas.",
    url: "/",
    siteName: "Priscilla Castro Official",
    images: [
      {
        url: "/og-priscilla-v2.jpg",
        width: 1200,
        height: 1200,
        alt: "Priscilla Castro - Cantante de Jazz & Soul",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Priscilla Castro | Música en Vivo para Eventos",
    description:
      "Tu evento debe sonar tan hermoso como se ve. R&B, soul, jazz y pop en formatos íntimos y premium para bodas, corporativos y celebraciones exclusivas.",
    images: ["/og-priscilla-v2.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "Priscilla Castro",
  url: "https://priscastromusic.com",
  logo: "https://priscastromusic.com/logo.png",
  image: "https://priscastromusic.com/hero.webp",
  description:
    "Cantante costarricense de Jazz y Soul establecida en CDMX. Reconocida por su elegancia vocal y trayectoria con artistas internacionales.",
  genre: ["Jazz", "Soul", "Blues", "Contemporary R&B"],
  location: {
    "@type": "Place",
    name: "Ciudad de México",
    address: {
      "@type": "PostalAddress",
      addressLocality: "CDMX",
      addressCountry: "MX",
    },
  },
  sameAs: [
    "https://www.instagram.com/priscastromusic",
    "https://www.facebook.com/pricastromusic",
    "https://www.youtube.com/@priscastromusic",
    "https://www.tiktok.com/@priscastromusic",
  ],
  offers: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Formato Essence Duo (Piano/Guitarra & Voz)",
        description: "Íntimo y sofisticado, ideal para cócteles y cenas.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Formato Signature Trio (Piano, Percusión y Voz)",
        description: "El equilibrio perfecto entre presencia y ambiente.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Formato Luxury Band",
        description: "Show Funk, Soul y Disco para momentos estelares.",
      },
    },
  ],
}

export default async function HomePage() {
  // In managed mode (prob.prosuite.pro) the landing of a specific tenant doesn't
  // belong at the platform root. Redirect operators to /super-admin instead.
  if (isManaged()) {
    redirect("/super-admin")
  }

  const tenant = await resolveCurrentTenant()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [upcomingShows, testimonials] = await Promise.all([
    db.bandEvent.findMany({
      where: { tenantId: tenant.id, published: true, date: { gte: today }, status: { not: "cancelled" } },
      orderBy: { date: "asc" },
      take: 8,
    }),
    db.review.findMany({
      where: { tenantId: tenant.id, published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ])

  const upcomingShowsForClient = upcomingShows.map((s) => ({
    id: s.id,
    title: s.title,
    kind: s.kind,
    dateIso: s.date.toISOString(),
    venueName: s.venueName,
    city: s.city,
    country: s.country,
    ticketUrl: s.ticketUrl,
    publicNotes: s.publicNotes,
  }))

  const testimonialsForClient = testimonials.map((r) => ({
    id: r.id,
    clientName: r.clientName,
    eventTitle: r.eventTitle,
    rating: r.rating,
    quote: r.quote,
    avatarUrl: r.avatarUrl,
  }))

  return (
    <>
      <Script
        id="json-ld-musicgroup"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage upcomingShows={upcomingShowsForClient} testimonials={testimonialsForClient} />
    </>
  )
}
