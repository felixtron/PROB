import { Moon, Sun } from "lucide-react"
import { toggleAdminThemeAction } from "@/app/admin/theme/actions"
import type { AdminTheme } from "@/lib/admin-theme"

export function ThemeToggle({ theme }: { theme: AdminTheme }) {
  // Server-side form: submitting flips the cookie and revalidates the admin.
  // No client JS state needed.
  const label = theme === "dark" ? "Modo claro" : "Modo oscuro"
  return (
    <form action={toggleAdminThemeAction} style={{ display: "inline-flex" }}>
      <button
        type="submit"
        className="button secondary"
        aria-label={label}
        title={label}
        style={{
          padding: "8px 10px",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
        }}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </form>
  )
}
