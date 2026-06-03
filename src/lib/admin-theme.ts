import { cookies } from "next/headers"

const COOKIE_NAME = "prob_admin_theme"
const DEFAULT_THEME: AdminTheme = "dark"

export type AdminTheme = "dark" | "light"

export async function getAdminTheme(): Promise<AdminTheme> {
  const store = await cookies()
  const value = store.get(COOKIE_NAME)?.value
  return value === "light" ? "light" : value === "dark" ? "dark" : DEFAULT_THEME
}

export async function setAdminTheme(theme: AdminTheme) {
  const store = await cookies()
  store.set(COOKIE_NAME, theme, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}
