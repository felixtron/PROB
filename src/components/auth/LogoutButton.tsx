import { LogOut } from "lucide-react"
import { logoutAction } from "@/app/login/actions"

export function LogoutButton({ variant = "platform" }: { variant?: "platform" | "sidebar" }) {
  if (variant === "sidebar") {
    return (
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-red-500/20 rounded-xl transition-all group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Cerrar sesión</span>
        </button>
      </form>
    )
  }
  return (
    <form action={logoutAction}>
      <button className="button secondary" type="submit">
        Salir
      </button>
    </form>
  )
}
