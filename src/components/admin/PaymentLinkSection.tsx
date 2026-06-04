"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { CreditCard, Copy, Check, MessageCircle } from "lucide-react"
import {
  generatePaymentLinkAction,
  type PaymentLinkActionState,
} from "@/app/admin/ventas/actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initial: PaymentLinkActionState = { ok: false }

function GenerateButton({ hasLink }: { hasLink: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-1.5 h-10 px-5 font-bold">
      <CreditCard className="w-4 h-4" />
      {pending ? "Generando…" : hasLink ? "Generar uno nuevo" : "Generar link de pago"}
    </Button>
  )
}

export function PaymentLinkSection({
  bookingId,
  clientName,
  clientWhatsapp,
  shortCode,
  depositLabel,
}: {
  bookingId: string
  clientName: string
  clientWhatsapp: string | null
  shortCode: string
  depositLabel: string
}) {
  const [state, formAction] = useActionState(generatePaymentLinkAction, initial)
  const [copied, setCopied] = useState(false)

  async function copyUrl() {
    if (!state.url) return
    try {
      await navigator.clipboard.writeText(state.url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      const input = document.createElement("input")
      input.value = state.url
      document.body.appendChild(input)
      input.select()
      try {
        document.execCommand("copy")
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      } catch {
        /* give up */
      }
      input.remove()
    }
  }

  const waHref =
    state.url && clientWhatsapp
      ? `https://wa.me/${clientWhatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
          `Hola ${clientName.split(" ")[0]}, te dejo el link para reservar tu fecha pagando el anticipo de ${depositLabel}.\n\nReserva ${shortCode}: ${state.url}\n\nUsa Visa, Mastercard o Amex. Pago seguro con Stripe.`,
        )}`
      : null

  return (
    <Card className="bg-white p-5 mb-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">Link de pago (anticipo)</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Genera un link de Stripe Checkout para que el cliente pague el anticipo. Idempotente: cada generación crea
            una nueva sesión, la que el cliente complete activa la confirmación automática.
          </div>
        </div>
      </div>

      {state.message ? (
        <div
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            state.ok
              ? "bg-green-500/10 text-green-700 border border-green-500/30"
              : "bg-red-500/10 text-red-700 border border-red-500/30"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      {state.url ? (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <Input value={state.url} readOnly className="font-mono text-xs" />
            <Button
              type="button"
              variant="outline"
              onClick={copyUrl}
              className={copied ? "gap-1.5 text-green-600 border-green-600/30 shrink-0" : "gap-1.5 shrink-0"}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <Button
                  type="button"
                  className="gap-1.5 shrink-0 bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar por WhatsApp
                </Button>
              </a>
            ) : null}
          </div>
          {!clientWhatsapp ? (
            <p className="text-xs text-muted-foreground">
              Agrega un WhatsApp al cliente arriba para enviarle el link con un click.
            </p>
          ) : null}
        </div>
      ) : null}

      <form action={formAction}>
        <input type="hidden" name="bookingId" value={bookingId} />
        <GenerateButton hasLink={Boolean(state.url)} />
      </form>
    </Card>
  )
}
