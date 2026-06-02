import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PROB",
  description: "Plataforma multi-tenant para artistas y proyectos de entretenimiento.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
