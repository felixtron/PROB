"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateBrandingAction, type BrandingActionState } from "@/app/admin/branding/actions"

const initial: BrandingActionState = { ok: false }

function ErrorText({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  const message = errors?.[name]?.[0]
  if (!message) return null
  return <span style={{ color: "#fb7185", fontSize: 12 }}>{message}</span>
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Guardando..." : "Guardar branding"}
    </button>
  )
}

export type BrandingFormProps = {
  initialState: {
    name: string
    projectType: string
    shortDescription: string
    longDescription: string
    city: string
    state: string
    country: string
    phone: string
    whatsapp: string
    email: string
    website: string
    currency: string
    timezone: string
    logoUrl: string
    heroImageUrl: string
    primaryColor: string
    secondaryColor: string
    instagramUrl: string
    facebookUrl: string
    tiktokUrl: string
    youtubeUrl: string
    spotifyUrl: string
  }
  readOnly: {
    slug: string
    primaryDomain: string | null
    status: string
  }
}

export function BrandingForm({ initialState, readOnly }: BrandingFormProps) {
  const [state, formAction] = useActionState(updateBrandingAction, initial)

  return (
    <form action={formAction} className="card" style={{ padding: 24, display: "grid", gap: 24 }}>
      {state.message ? (
        <p style={{ color: state.ok ? "#86efac" : "#fb7185", margin: 0, fontSize: 13 }}>{state.message}</p>
      ) : null}

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Identificadores (no editables)</h2>
        <div className="grid-3">
          <div className="field">
            <label>Slug</label>
            <input value={readOnly.slug} disabled />
          </div>
          <div className="field">
            <label>Dominio principal</label>
            <input value={readOnly.primaryDomain ?? "—"} disabled />
          </div>
          <div className="field">
            <label>Estado</label>
            <input value={readOnly.status} disabled />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Información general</h2>
        <div className="grid-2">
          <div className="field">
            <label>Nombre</label>
            <input name="name" defaultValue={initialState.name} />
            <ErrorText name="name" errors={state.fieldErrors} />
          </div>
          <div className="field">
            <label>Tipo de proyecto</label>
            <input name="projectType" defaultValue={initialState.projectType} placeholder="artist · band · dj · agency" />
            <ErrorText name="projectType" errors={state.fieldErrors} />
          </div>
        </div>
        <div className="field">
          <label>Descripción corta</label>
          <input name="shortDescription" defaultValue={initialState.shortDescription} />
        </div>
        <div className="field">
          <label>Descripción larga</label>
          <textarea name="longDescription" defaultValue={initialState.longDescription} />
        </div>
      </section>

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Contacto</h2>
        <div className="grid-3">
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" defaultValue={initialState.email} />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input name="phone" defaultValue={initialState.phone} />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input name="whatsapp" defaultValue={initialState.whatsapp} />
          </div>
        </div>
        <div className="grid-3">
          <div className="field">
            <label>Ciudad</label>
            <input name="city" defaultValue={initialState.city} />
          </div>
          <div className="field">
            <label>Estado</label>
            <input name="state" defaultValue={initialState.state} />
          </div>
          <div className="field">
            <label>País</label>
            <input name="country" defaultValue={initialState.country} />
          </div>
        </div>
        <div className="field">
          <label>Sitio web</label>
          <input name="website" defaultValue={initialState.website} placeholder="https://..." />
        </div>
      </section>

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Marca visual</h2>
        <div className="grid-2">
          <div className="field">
            <label>Logo URL</label>
            <input name="logoUrl" defaultValue={initialState.logoUrl} placeholder="https://..." />
          </div>
          <div className="field">
            <label>Hero image URL</label>
            <input name="heroImageUrl" defaultValue={initialState.heroImageUrl} placeholder="https://..." />
          </div>
          <div className="field">
            <label>Color primario</label>
            <input name="primaryColor" defaultValue={initialState.primaryColor} placeholder="#e11d48" />
            <ErrorText name="primaryColor" errors={state.fieldErrors} />
          </div>
          <div className="field">
            <label>Color secundario</label>
            <input name="secondaryColor" defaultValue={initialState.secondaryColor} placeholder="#111827" />
            <ErrorText name="secondaryColor" errors={state.fieldErrors} />
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Redes sociales</h2>
        <div className="grid-2">
          <input name="instagramUrl" defaultValue={initialState.instagramUrl} placeholder="Instagram URL" />
          <input name="facebookUrl" defaultValue={initialState.facebookUrl} placeholder="Facebook URL" />
          <input name="tiktokUrl" defaultValue={initialState.tiktokUrl} placeholder="TikTok URL" />
          <input name="youtubeUrl" defaultValue={initialState.youtubeUrl} placeholder="YouTube URL" />
          <input name="spotifyUrl" defaultValue={initialState.spotifyUrl} placeholder="Spotify URL" />
        </div>
      </section>

      <section style={{ display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Localización</h2>
        <div className="grid-2">
          <div className="field">
            <label>Moneda (3 letras)</label>
            <input name="currency" defaultValue={initialState.currency} maxLength={3} />
          </div>
          <div className="field">
            <label>Zona horaria</label>
            <input name="timezone" defaultValue={initialState.timezone} />
          </div>
        </div>
      </section>

      <div>
        <Submit />
      </div>
    </form>
  )
}
