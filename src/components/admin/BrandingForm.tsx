"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateBrandingAction, type BrandingActionState } from "@/app/admin/branding/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const initial: BrandingActionState = { ok: false }

function ErrorText({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  const message = errors?.[name]?.[0]
  if (!message) return null
  return <span className="text-red-600 text-xs">{message}</span>
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 px-5 font-bold">
      {pending ? "Guardando..." : "Guardar branding"}
    </Button>
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
    legalName: string
    legalRfc: string
    contractLegalText: string
  }
  readOnly: {
    slug: string
    primaryDomain: string | null
    status: string
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-bold m-0 pb-2 border-b border-border/40">{title}</h2>
      {children}
    </section>
  )
}

export function BrandingForm({ initialState, readOnly }: BrandingFormProps) {
  const [state, formAction] = useActionState(updateBrandingAction, initial)

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm space-y-8">
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

      <Section title="Identificadores (no editables)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={readOnly.slug} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Dominio principal</Label>
            <Input value={readOnly.primaryDomain ?? "—"} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Input value={readOnly.status} disabled />
          </div>
        </div>
      </Section>

      <Section title="Información general">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={initialState.name} />
            <ErrorText name="name" errors={state.fieldErrors} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="projectType">Tipo de proyecto</Label>
            <Input id="projectType" name="projectType" defaultValue={initialState.projectType} placeholder="artist · band · dj · agency" />
            <ErrorText name="projectType" errors={state.fieldErrors} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="shortDescription">Descripción corta</Label>
          <Input id="shortDescription" name="shortDescription" defaultValue={initialState.shortDescription} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="longDescription">Descripción larga</Label>
          <Textarea id="longDescription" name="longDescription" defaultValue={initialState.longDescription} rows={3} />
        </div>
      </Section>

      <Section title="Contacto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={initialState.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" defaultValue={initialState.phone} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={initialState.whatsapp} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" defaultValue={initialState.city} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">Estado</Label>
            <Input id="state" name="state" defaultValue={initialState.state} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">País</Label>
            <Input id="country" name="country" defaultValue={initialState.country} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="website">Sitio web</Label>
          <Input id="website" name="website" defaultValue={initialState.website} placeholder="https://..." />
        </div>
      </Section>

      <Section title="Marca visual">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" name="logoUrl" defaultValue={initialState.logoUrl} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="heroImageUrl">Hero image URL</Label>
            <Input id="heroImageUrl" name="heroImageUrl" defaultValue={initialState.heroImageUrl} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="primaryColor">Color primario</Label>
            <Input id="primaryColor" name="primaryColor" defaultValue={initialState.primaryColor} placeholder="#e11d48" />
            <ErrorText name="primaryColor" errors={state.fieldErrors} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="secondaryColor">Color secundario</Label>
            <Input id="secondaryColor" name="secondaryColor" defaultValue={initialState.secondaryColor} placeholder="#111827" />
            <ErrorText name="secondaryColor" errors={state.fieldErrors} />
          </div>
        </div>
      </Section>

      <Section title="Redes sociales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="instagramUrl" defaultValue={initialState.instagramUrl} placeholder="Instagram URL" />
          <Input name="facebookUrl" defaultValue={initialState.facebookUrl} placeholder="Facebook URL" />
          <Input name="tiktokUrl" defaultValue={initialState.tiktokUrl} placeholder="TikTok URL" />
          <Input name="youtubeUrl" defaultValue={initialState.youtubeUrl} placeholder="YouTube URL" />
          <Input name="spotifyUrl" defaultValue={initialState.spotifyUrl} placeholder="Spotify URL" />
        </div>
      </Section>

      <Section title="Localización">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="currency">Moneda (3 letras)</Label>
            <Input id="currency" name="currency" defaultValue={initialState.currency} maxLength={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Zona horaria</Label>
            <Input id="timezone" name="timezone" defaultValue={initialState.timezone} />
          </div>
        </div>
      </Section>

      <Section title="Datos legales">
        <p className="text-muted-foreground text-sm m-0">
          Aparecen en los contratos. Se sustituyen las variables{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-xs">{"{{tenantLegalName}}"}</code> y{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-xs">{"{{tenantLegalRfc}}"}</code> al emitir.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="legalName">Razón social / nombre legal</Label>
            <Input id="legalName" name="legalName" defaultValue={initialState.legalName} placeholder="Si va distinto al nombre comercial" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="legalRfc">RFC</Label>
            <Input id="legalRfc" name="legalRfc" defaultValue={initialState.legalRfc} placeholder="XAXX010101000" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contractLegalText">Texto del contrato (template, opcional)</Label>
          <Textarea
            id="contractLegalText"
            name="contractLegalText"
            defaultValue={initialState.contractLegalText}
            placeholder="Deja vacío para usar el template por defecto. Soporta {{vars}}: tenantLegalName, tenantLegalRfc, clientName, packageName, eventDate, startTime, endTime, address, city, state, guestCount, baseAmount, depositAmount, balanceAmount, signedDateLabel."
            rows={10}
            className="font-mono text-xs"
          />
        </div>
      </Section>

      <div>
        <Submit />
      </div>
    </form>
  )
}
