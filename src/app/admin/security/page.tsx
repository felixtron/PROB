import { redirect } from "next/navigation"
import { KeyRound } from "lucide-react"
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { getSessionUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function SecurityPage() {
  await resolveCurrentTenant()
  const user = await getSessionUser()
  if (!user) redirect("/login")

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Seguridad</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Cambia la contraseña de <strong className="text-foreground">{user.email}</strong>. Al actualizar, otras sesiones abiertas en
          otros dispositivos quedarán cerradas automáticamente.
        </p>
      </div>

      <div className="max-w-xl">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
