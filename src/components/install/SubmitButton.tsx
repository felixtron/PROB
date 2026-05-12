"use client"

import { useFormStatus } from "react-dom"

export function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Instalando..." : "Completar instalación"}
    </button>
  )
}
