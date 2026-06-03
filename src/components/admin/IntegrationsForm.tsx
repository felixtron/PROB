"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  updateIntegrationsAction,
  testStripeAction,
  testEvolutionAction,
  type IntegrationsState,
} from "@/app/admin/integrations/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const initial: IntegrationsState = { ok: false }

function PrimarySubmit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? pendingLabel : label}
    </Button>
  )
}

function SecondarySubmit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? pendingLabel : label}
    </Button>
  )
}

function ResultMessage({ state }: { state: IntegrationsState }) {
  if (!state.message) return null
  return (
    <div
      className={`rounded-lg px-3 py-2 text-sm font-medium ${
        state.ok
          ? "bg-green-500/10 text-green-700 border border-green-500/30"
          : "bg-red-500/10 text-red-700 border border-red-500/30"
      }`}
    >
      {state.message}
    </div>
  )
}

export type IntegrationsFormProps = {
  mode: "managed" | "standalone"
  webhookUrl: string
  evolutionWebhookUrl: string
  initialState: {
    hasStripeSecret: boolean
    hasStripeWebhookSecret: boolean
    hasEvolutionApiKey: boolean
    stripePublishableKeyHint: string
    evolutionBaseUrl: string
    evolutionInstance: string
  }
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <code className="block rounded-lg bg-muted text-foreground px-3 py-2.5 text-xs font-mono break-all border border-border/40">
      {children}
    </code>
  )
}

export function IntegrationsForm({ mode, webhookUrl, evolutionWebhookUrl, initialState }: IntegrationsFormProps) {
  const [saveState, saveAction] = useActionState(updateIntegrationsAction, initial)
  const [stripeTestState, stripeTestAction] = useActionState(testStripeAction, initial)
  const [evolutionTestState, evolutionTestAction] = useActionState(testEvolutionAction, initial)

  return (
    <div className="space-y-6">
      <form action={saveAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-8">
        <ResultMessage state={saveState} />

        <section className="space-y-4">
          <h2 className="text-base font-bold m-0 pb-2 border-b border-border/40">Stripe</h2>
          {mode === "managed" ? (
            <p className="text-muted-foreground text-sm m-0">
              Stripe Connect onboarding — próximamente. En esta versión solo se configura Stripe directo en instalaciones standalone.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground text-sm m-0">
                Cobros directos con tus llaves. No usamos Connect ni cobramos comisión.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="stripeSecretKey">Secret key (sk_…)</Label>
                  <Input
                    id="stripeSecretKey"
                    name="stripeSecretKey"
                    type="password"
                    placeholder={initialState.hasStripeSecret ? "•••• (configurada · cambiar)" : "sk_live_…"}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stripeWebhookSecret">Webhook secret (whsec_…)</Label>
                  <Input
                    id="stripeWebhookSecret"
                    name="stripeWebhookSecret"
                    type="password"
                    placeholder={initialState.hasStripeWebhookSecret ? "•••• (configurada · cambiar)" : "whsec_…"}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stripePublishableKeyHint">Publishable key (pk_…)</Label>
                <Input
                  id="stripePublishableKeyHint"
                  name="stripePublishableKeyHint"
                  defaultValue={initialState.stripePublishableKeyHint}
                  placeholder="pk_live_…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>URL del webhook (copia esto en el dashboard de Stripe)</Label>
                <CodeBlock>{webhookUrl}</CodeBlock>
              </div>
            </>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold m-0 pb-2 border-b border-border/40">Evolution (WhatsApp)</h2>
          <p className="text-muted-foreground text-sm m-0">
            Configura el servidor de Evolution para que la app pueda enviar mensajes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="evolutionBaseUrl">Base URL</Label>
              <Input
                id="evolutionBaseUrl"
                name="evolutionBaseUrl"
                defaultValue={initialState.evolutionBaseUrl}
                placeholder="https://evolution.tu-dominio.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="evolutionInstance">Instance</Label>
              <Input
                id="evolutionInstance"
                name="evolutionInstance"
                defaultValue={initialState.evolutionInstance}
                placeholder="prisca"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="evolutionApiKey">API Key</Label>
            <Input
              id="evolutionApiKey"
              name="evolutionApiKey"
              type="password"
              placeholder={initialState.hasEvolutionApiKey ? "•••• (configurada · cambiar)" : ""}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label>URL del webhook (copia esto en Evolution para recibir mensajes)</Label>
            <CodeBlock>{evolutionWebhookUrl}</CodeBlock>
            <p className="text-xs text-muted-foreground m-0">
              Evolution debe enviar el header <code className="px-1 py-0.5 rounded bg-muted text-[11px]">apikey</code> con el mismo
              valor configurado arriba — lo verificamos antes de aceptar cualquier mensaje (timing-safe compare).
            </p>
          </div>
        </section>

        <div>
          <PrimarySubmit label="Guardar integraciones" pendingLabel="Guardando..." />
        </div>
      </form>

      {mode === "standalone" ? (
        <form action={stripeTestAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold m-0">Probar Stripe</h3>
          <ResultMessage state={stripeTestState} />
          <p className="text-muted-foreground text-sm m-0">
            Verifica la llave guardada con una llamada de prueba (balance.retrieve).
          </p>
          <div>
            <SecondarySubmit label="Probar llave guardada" pendingLabel="Probando..." />
          </div>
        </form>
      ) : null}

      <form action={evolutionTestAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold m-0">Probar envío Evolution</h3>
        <ResultMessage state={evolutionTestState} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="number">Número destino (con código país)</Label>
            <Input id="number" name="number" placeholder="5215512345678" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="text">Texto</Label>
            <Input id="text" name="text" defaultValue="Prueba de Evolution desde PROB." />
          </div>
        </div>
        <div>
          <SecondarySubmit label="Enviar test" pendingLabel="Enviando..." />
        </div>
      </form>
    </div>
  )
}
