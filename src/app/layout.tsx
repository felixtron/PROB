import type { Metadata } from "next"
import { Inter, Montserrat, Playfair_Display, Syne, Marcellus } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
})

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PROB",
  description: "Plataforma multi-tenant para artistas y proyectos de entretenimiento.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontClasses = [
    inter.variable,
    montserrat.variable,
    playfair.variable,
    syne.variable,
    marcellus.variable,
  ].join(" ")

  return (
    <html lang="es" className={fontClasses}>
      <body>{children}</body>
    </html>
  )
}
