"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { recordClientSignatureAction, type SignState } from "@/app/firma/[shortToken]/actions"
import { SignaturePad } from "./SignaturePad"

const initial: SignState = { ok: false }

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="button"
      disabled={pending || disabled}
      style={{ padding: "14px 28px", fontSize: 14 }}
    >
      {pending ? "Firmando..." : "Firmar contrato"}
    </button>
  )
}

export function ClientSignForm({
  shortToken,
  defaultName,
}: {
  shortToken: string
  defaultName: string
}) {
  const [state, formAction] = useActionState(recordClientSignatureAction, initial)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const canSubmit = Boolean(dataUrl) && acceptedTerms

  return (
    <form action={formAction} style={{ display: "grid", gap: 18 }}>
      <input type="hidden" name="shortToken" value={shortToken} />
      <input type="hidden" name="signatureDataUrl" value={dataUrl ?? ""} />

      {state.message ? (
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

      <div className="field">
        <label>Tu nombre completo</label>
        <input
          name="signerName"
          defaultValue={defaultName}
          placeholder="Como aparece en tu identificación"
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            color: "var(--foreground)",
            opacity: 0.9,
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Tu firma
        </label>
        <SignaturePad onChange={setDataUrl} />
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          He leído y acepto los términos del contrato. Mi firma electrónica tiene la misma validez que una firma autógrafa.
        </span>
      </label>

      <Submit disabled={!canSubmit} />
    </form>
  )
}
