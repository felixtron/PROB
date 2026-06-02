"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  updateIntegrationsAction,
  testStripeAction,
  testEvolutionAction,
  type IntegrationsState,
} from "@/app/admin/integrations/actions"

const initial: IntegrationsState = { ok: false }

function PrimarySubmit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? pendingLabel : label}
    </button>
  )
}

function SecondarySubmit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="button secondary" disabled={pending} type="submit">
      {pending ? pendingLabel : label}
    </button>
  )
}

function ResultMessage({ state }: { state: IntegrationsState }) {
  if (!state.message) return null
  const color = state.ok ? "#86efac" : "#fb7185"
  return (
    <p style={{ color, margin: 0, fontSize: 13 }}>{state.message}</p>
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

export function IntegrationsForm({ mode, webhookUrl, evolutionWebhookUrl, initialState }: IntegrationsFormProps) {
  const [saveState, saveAction] = useActionState(updateIntegrationsAction, initial)
  const [stripeTestState, stripeTestAction] = useActionState(testStripeAction, initial)
  const [evolutionTestState, evolutionTestAction] = useActionState(testEvolutionAction, initial)

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <form action={saveAction} className="card" style={{ padding: 24, display: "grid", gap: 24 }}>
        <ResultMessage state={saveState} />

        <section style={{ display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0 }}>Stripe</h2>
          {mode === "managed" ? (
            <p className="muted" style={{ margin: 0 }}>
              Stripe Connect onboarding — próximamente. En esta versión solo se configura Stripe directo en instalaciones standalone.
            </p>
          ) : (
            <>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                Cobros directos con tus llaves. No usamos Connect ni cobramos comisión.
              </p>
              <div className="grid-2">
                <div className="field">
                  <label>Secret key (sk_…)</label>
                  <input
                    name="stripeSecretKey"
                    type="password"
                    placeholder={initialState.hasStripeSecret ? "•••• (configurada · cambiar)" : "sk_live_…"}
                    autoComplete="off"
                  />
                </div>
                <div className="field">
                  <label>Webhook secret (whsec_…)</label>
                  <input
                    name="stripeWebhookSecret"
                    type="password"
                    placeholder={initialState.hasStripeWebhookSecret ? "•••• (configurada · cambiar)" : "whsec_…"}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="field">
                <label>Publishable key (pk_…)</label>
                <input
                  name="stripePublishableKeyHint"
                  defaultValue={initialState.stripePublishableKeyHint}
                  placeholder="pk_live_…"
                />
              </div>
              <div className="field">
                <label>URL del webhook (copia esto en el dashboard de Stripe)</label>
                <code
                  style={{
                    background: "#0b1220",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    wordBreak: "break-all",
                    border: "1px solid var(--border)",
                  }}
                >
                  {webhookUrl}
                </code>
              </div>
            </>
          )}
        </section>

        <section style={{ display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0 }}>Evolution (WhatsApp)</h2>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Configura el servidor de Evolution para que la app pueda enviar mensajes.
          </p>
          <div className="grid-2">
            <div className="field">
              <label>Base URL</label>
              <input
                name="evolutionBaseUrl"
                defaultValue={initialState.evolutionBaseUrl}
                placeholder="https://evolution.tu-dominio.com"
              />
            </div>
            <div className="field">
              <label>Instance</label>
              <input
                name="evolutionInstance"
                defaultValue={initialState.evolutionInstance}
                placeholder="prisca"
              />
            </div>
          </div>
          <div className="field">
            <label>API Key</label>
            <input
              name="evolutionApiKey"
              type="password"
              placeholder={initialState.hasEvolutionApiKey ? "•••• (configurada · cambiar)" : ""}
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label>URL del webhook (copia esto en Evolution para recibir mensajes)</label>
            <code
              style={{
                background: "color-mix(in srgb, var(--card) 70%, black 10%)",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 12,
                wordBreak: "break-all",
                border: "1px solid var(--border)",
              }}
            >
              {evolutionWebhookUrl}
            </code>
            <span className="muted" style={{ fontSize: 11 }}>
              Evolution debe enviar el header <code>apikey</code> con el mismo valor configurado arriba —
              lo verificamos antes de aceptar cualquier mensaje (timing-safe compare).
            </span>
          </div>
        </section>

        <div>
          <PrimarySubmit label="Guardar integraciones" pendingLabel="Guardando..." />
        </div>
      </form>

      {mode === "standalone" ? (
        <form action={stripeTestAction} className="card" style={{ padding: 20, display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Probar Stripe</h3>
          <ResultMessage state={stripeTestState} />
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Verifica la llave guardada con una llamada de prueba (balance.retrieve).
          </p>
          <div>
            <SecondarySubmit label="Probar llave guardada" pendingLabel="Probando..." />
          </div>
        </form>
      ) : null}

      <form action={evolutionTestAction} className="card" style={{ padding: 20, display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Probar envío Evolution</h3>
        <ResultMessage state={evolutionTestState} />
        <div className="grid-2">
          <div className="field">
            <label>Número destino (con código país)</label>
            <input name="number" placeholder="5215512345678" />
          </div>
          <div className="field">
            <label>Texto</label>
            <input name="text" defaultValue="Prueba de Evolution desde PROB." />
          </div>
        </div>
        <div>
          <SecondarySubmit label="Enviar test" pendingLabel="Enviando..." />
        </div>
      </form>
    </div>
  )
}
