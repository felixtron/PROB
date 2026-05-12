import { redirect } from "next/navigation"
import { isInstalled } from "@/lib/install"
import { InstallWizard } from "@/components/install/InstallWizard"

export default async function InstallPage() {
  if (await isInstalled()) redirect("/admin")

  return (
    <main className="page-shell" style={{ padding: "48px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          PROB Installer
        </p>
        <h1 style={{ fontSize: 44, lineHeight: 1, margin: "8px 0" }}>Instala una nueva plataforma para artistas</h1>
        <p className="muted" style={{ maxWidth: 760 }}>
          Este wizard inicializa marca, contacto, administrador, paquetes base e integraciones opcionales.
          Funciona como un install.exe, pero para una aplicación Next.js desplegada en tu dominio.
        </p>
      </div>
      <InstallWizard />
    </main>
  )
}
