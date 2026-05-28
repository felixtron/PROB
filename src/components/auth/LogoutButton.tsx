import { logoutAction } from "@/app/login/actions"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="button secondary" type="submit">
        Salir
      </button>
    </form>
  )
}
