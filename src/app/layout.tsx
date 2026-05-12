import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "PROB Installer",
  description: "Plantilla instalable para bandas, artistas y proyectos de entretenimiento.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
