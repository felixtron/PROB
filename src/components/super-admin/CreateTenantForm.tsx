"use client"

import { useActionState } from "react"
import { createTenantAction, type CreateTenantActionState } from "@/app/super-admin/actions"

const initialState: CreateTenantActionState = { ok: false }

type TemplateOption = {
  id: string
  name: string
  description: string | null
  defaultProjectType: string
  defaultPrimaryColor: string
  defaultSecondaryColor: string
}

function ErrorText({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  const message = errors?.[name]?.[0]
  if (!message) return null
  return <span style={{ color: "#fb7185", fontSize: 12 }}>{message}</span>
}

export function CreateTenantForm({ templates }: { templates: TemplateOption[] }) {
  const [state, formAction, pending] = useActionState(createTenantAction, initialState)
  const defaultTemplate = templates[0]

  return (
    <form action={formAction} className="card" style={{ padding: 20, display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0 }}>Nuevo tenant</h2>
        <p className="muted" style={{ margin: "6px 0 0" }}>
          Crea un proyecto replicado desde una plantilla operativa.
        </p>
      </div>

      {state.message ? (
        <div className="card" style={{ borderColor: "#fb7185", padding: 12, color: "#fecdd3" }}>
          {state.message}
        </div>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label>Plantilla</label>
          <select name="templateId" defaultValue={defaultTemplate?.id}>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Nombre del proyecto</label>
          <input name="organizationName" placeholder="Cliente / Banda / Artista" />
          <ErrorText name="organizationName" errors={state.fieldErrors} />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Tipo</label>
          <select name="projectType" defaultValue={defaultTemplate?.defaultProjectType ?? "band"}>
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

      <div className="grid-2">
        <div className="field">
          <label>Email público</label>
          <input name="email" type="email" placeholder="contacto@cliente.com" />
          <ErrorText name="email" errors={state.fieldErrors} />
        </div>
        <div className="field">
          <label>País</label>
          <input name="country" defaultValue="México" />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Admin inicial</label>
          <input name="adminName" placeholder="Nombre" />
          <ErrorText name="adminName" errors={state.fieldErrors} />
        </div>
        <div className="field">
          <label>Email admin</label>
          <input name="adminEmail" type="email" placeholder="admin@cliente.com" />
          <ErrorText name="adminEmail" errors={state.fieldErrors} />
        </div>
        <div className="field">
          <label>Password temporal</label>
          <input name="adminPassword" type="password" placeholder="Opcional" />
          <ErrorText name="adminPassword" errors={state.fieldErrors} />
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label>Moneda</label>
          <input name="currency" defaultValue="MXN" />
        </div>
        <div className="field">
          <label>Zona horaria</label>
          <input name="timezone" defaultValue="America/Mexico_City" />
        </div>
        <div className="field">
          <label>Color primario</label>
          <input name="primaryColor" defaultValue={defaultTemplate?.defaultPrimaryColor ?? "#e11d48"} />
        </div>
      </div>

      <input name="secondaryColor" type="hidden" value={defaultTemplate?.defaultSecondaryColor ?? "#111827"} />
      <input name="packagePreset" type="hidden" value="band" />
      <button className="button" disabled={pending} type="submit">
        {pending ? "Creando..." : "Crear tenant"}
      </button>
    </form>
  )
}
