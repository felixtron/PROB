"use client"

import { useRef, useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { submitFunnelAction, type FunnelState } from "@/app/cotizar/actions"
import { FunnelStepper } from "./FunnelStepper"
import { Step1Package, type FunnelPackage } from "./Step1Package"
import { Step2Location } from "./Step2Location"
import { Step3Date } from "./Step3Date"
import { Step4Contact } from "./Step4Contact"

const initial: FunnelState = { ok: false }

const STEP_REQUIRED: Record<number, string[]> = {
  0: ["packageId", "guestCount"],
  1: ["address", "city", "state"],
  2: ["requestedDate", "startTime", "endTime"],
  3: ["clientName", "clientPhone"],
}

const STEP_FRIENDLY: Record<string, string> = {
  packageId: "Elige un paquete",
  guestCount: "Indica el número de invitados",
  address: "Escribe la dirección",
  city: "Ciudad",
  state: "Estado",
  requestedDate: "Fecha del evento",
  startTime: "Hora de inicio",
  endTime: "Hora de fin",
  clientName: "Tu nombre",
  clientPhone: "Teléfono de contacto",
}

function firstMissing(form: HTMLFormElement, fields: string[]): string | null {
  for (const name of fields) {
    const els = form.elements.namedItem(name)
    let value = ""
    if (els instanceof RadioNodeList) {
      for (const el of Array.from(els)) {
        if (el instanceof HTMLInputElement && el.checked) {
          value = el.value
          break
        }
      }
    } else if (els instanceof HTMLInputElement || els instanceof HTMLSelectElement || els instanceof HTMLTextAreaElement) {
      value = els.value
    }
    if (!value.toString().trim()) {
      if (els instanceof HTMLInputElement || els instanceof HTMLSelectElement || els instanceof HTMLTextAreaElement) {
        try {
          els.focus()
        } catch {
          /* ignore */
        }
      }
      return name
    }
  }
  return null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button className="button" type="submit" disabled={pending} style={{ padding: "14px 28px", fontSize: 14 }}>
      {pending ? "Enviando..." : "Enviar cotización"}
    </button>
  )
}

export function FunnelWizard({
  packages,
  initialPackageId,
}: {
  packages: FunnelPackage[]
  initialPackageId?: string
}) {
  const [step, setStep] = useState(0)
  const [state, formAction] = useActionState(submitFunnelAction, initial)
  const [hint, setHint] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function tryAdvance() {
    setHint(null)
    if (!formRef.current) return
    const required = STEP_REQUIRED[step] ?? []
    const missing = firstMissing(formRef.current, required)
    if (missing) {
      setHint(`Falta: ${STEP_FRIENDLY[missing] ?? missing}`)
      return
    }
    setStep((s) => Math.min(3, s + 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goBack() {
    setHint(null)
    setStep((s) => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const showServerError = state.message && !state.ok

  return (
    <form ref={formRef} action={formAction} style={{ display: "grid", gap: 28 }}>
      <FunnelStepper current={step} />

      {showServerError ? (
        <div
          role="alert"
          className="card"
          style={{
            padding: 14,
            borderColor: "rgba(251,113,133,0.6)",
            background: "color-mix(in srgb, oklch(0.6 0.22 25) 12%, var(--card))",
          }}
        >
          <p style={{ color: "#fecdd3", margin: 0, fontSize: 13 }}>{state.message}</p>
        </div>
      ) : null}
      {hint ? (
        <div
          role="status"
          className="card"
          style={{
            padding: 14,
            borderColor: "rgba(251,191,36,0.5)",
            background: "color-mix(in srgb, oklch(0.7 0.16 80) 12%, var(--card))",
          }}
        >
          <p style={{ color: "#fcd34d", margin: 0, fontSize: 13 }}>{hint}</p>
        </div>
      ) : null}

      <div className="card" style={{ padding: "32px 28px" }}>
        <div hidden={step !== 0}>
          <Step1Package packages={packages} initialSelectedId={initialPackageId} />
        </div>
        <div hidden={step !== 1}>
          <Step2Location />
        </div>
        <div hidden={step !== 2}>
          <Step3Date />
        </div>
        <div hidden={step !== 3}>
          <Step4Contact />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="button secondary"
          onClick={goBack}
          disabled={step === 0}
          style={{ padding: "10px 18px", fontSize: 13, visibility: step === 0 ? "hidden" : "visible" }}
        >
          ← Atrás
        </button>

        {step < 3 ? (
          <button
            type="button"
            className="button"
            onClick={tryAdvance}
            style={{ padding: "14px 28px", fontSize: 14 }}
          >
            Continuar →
          </button>
        ) : (
          <SubmitButton />
        )}
      </div>
    </form>
  )
}
