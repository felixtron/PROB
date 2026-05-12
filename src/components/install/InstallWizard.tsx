"use client"

import { useActionState } from "react"
import { runInstallAction, type InstallActionState } from "@/app/install/actions"
import { SubmitButton } from "@/components/install/SubmitButton"

const initialState: InstallActionState = { ok: false }

function ErrorText({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  const message = errors?.[name]?.[0]
  if (!message) return null
  return <span style={{ color: "#fb7185", fontSize: 12 }}>{message}</span>
}

export function InstallWizard() {
  const [state, formAction] = useActionState(runInstallAction, initialState)

  return (
    <form action={formAction} className="card" style={{ padding: 24, display: "grid", gap: 28 }}>
      {state.message ? (
        <div className="card" style={{ borderColor: "#fb7185", padding: 14, color: "#fecdd3" }}>
          {state.message}
        </div>
      ) : null}

      <section style={{ display: "grid", gap: 16 }}>
        <h2>1. Información general</h2>
        <div className="grid-2">
          <div className="field">
            <label>Nombre de la agrupación</label>
            <input name="organizationName" placeholder="Vendetta / Banda / Artista" />
            <ErrorText name="organizationName" errors={state.fieldErrors} />
          </div>
          <div className="field">
            <label>Tipo de proyecto</label>
            <select name="projectType" defaultValue="band">
              <option value="band">Banda</option>
              <option value="dj">DJ</option>
              <option value="artist">Artista solista</option>
              <option value="agency">Agencia / Producción</option>
              <option value="other">Otro</option>
            </select>
            <ErrorText name="projectType" errors={state.fieldErrors} />
          </div>
        </div>
        <div className="field">
          <label>Descripción corta</label>
          <input name="shortDescription" placeholder="Show musical para eventos premium" />
        </div>
        <div className="field">
          <label>Descripción larga</label>
          <textarea name="longDescription" placeholder="Cuenta qué hace especial al proyecto..." />
        </div>
        <div className="grid-3">
          <div className="field">
            <label>Ciudad</label>
            <input name="city" />
          </div>
          <div className="field">
            <label>Estado</label>
            <input name="state" />
          </div>
          <div className="field">
            <label>País</label>
            <input name="country" defaultValue="México" />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h2>2. Contacto y marca</h2>
        <div className="grid-3">
          <div className="field">
            <label>Email público</label>
            <input name="email" type="email" placeholder="contacto@proyecto.com" />
            <ErrorText name="email" errors={state.fieldErrors} />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input name="phone" />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input name="whatsapp" placeholder="521..." />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Sitio web</label>
            <input name="website" placeholder="https://..." />
          </div>
          <div className="field">
            <label>Logo URL</label>
            <input name="logoUrl" placeholder="https://..." />
          </div>
          <div className="field">
            <label>Hero image URL</label>
            <input name="heroImageUrl" placeholder="https://..." />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Color primario</label>
              <input name="primaryColor" defaultValue="#e11d48" />
            </div>
            <div className="field">
              <label>Color secundario</label>
              <input name="secondaryColor" defaultValue="#111827" />
            </div>
          </div>
        </div>
        <div className="grid-3">
          <input name="instagramUrl" placeholder="Instagram URL" />
          <input name="facebookUrl" placeholder="Facebook URL" />
          <input name="tiktokUrl" placeholder="TikTok URL" />
          <input name="youtubeUrl" placeholder="YouTube URL" />
          <input name="spotifyUrl" placeholder="Spotify URL" />
        </div>
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h2>3. Administrador inicial</h2>
        <div className="grid-3">
          <div className="field">
            <label>Nombre</label>
            <input name="adminName" />
            <ErrorText name="adminName" errors={state.fieldErrors} />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="adminEmail" type="email" />
            <ErrorText name="adminEmail" errors={state.fieldErrors} />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input name="adminPassword" type="password" />
            <ErrorText name="adminPassword" errors={state.fieldErrors} />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h2>4. Configuración inicial</h2>
        <div className="grid-3">
          <div className="field">
            <label>Preset de paquetes</label>
            <select name="packagePreset" defaultValue="band">
              <option value="band">Banda</option>
              <option value="dj">DJ</option>
              <option value="artist">Artista</option>
              <option value="agency">Agencia</option>
              <option value="blank">Sin paquetes</option>
            </select>
          </div>
          <div className="field">
            <label>Moneda</label>
            <input name="currency" defaultValue="MXN" />
          </div>
          <div className="field">
            <label>Zona horaria</label>
            <input name="timezone" defaultValue="America/Mexico_City" />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h2>5. Opcionales</h2>
        <div className="grid-2">
          <input name="bankName" placeholder="Banco" />
          <input name="bankAccount" placeholder="Cuenta" />
          <input name="bankClabe" placeholder="CLABE" />
          <input name="bankBeneficiary" placeholder="Beneficiario" />
          <input name="stripePublishableKeyHint" placeholder="Stripe publishable key (pk_...)" />
          <input name="evolutionBaseUrl" placeholder="Evolution Base URL" />
          <input name="evolutionInstance" placeholder="Evolution instance" />
          <input name="googleCalendarId" placeholder="Google Calendar ID" />
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <p className="muted" style={{ margin: 0 }}>
          Al instalar, `/install` queda bloqueado y el panel admin queda habilitado.
        </p>
        <SubmitButton />
      </div>
    </form>
  )
}
