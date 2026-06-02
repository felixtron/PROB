"use client"

import { useState } from "react"

export type FunnelPackage = {
  id: string
  name: string
  description: string
  includes: string[]
}

export function Step1Package({ packages }: { packages: FunnelPackage[] }) {
  const [selectedId, setSelectedId] = useState<string>("")

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Elige el formato
        </h2>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Cada formato se ajusta a la energía del evento. Sigue siempre el mismo estándar de calidad.
        </p>
      </div>

      <div className="grid-3">
        {packages.map((p) => {
          const isSelected = selectedId === p.id
          return (
            <label
              key={p.id}
              className="card"
              style={{
                padding: 22,
                display: "grid",
                gap: 14,
                cursor: "pointer",
                borderColor: isSelected ? "var(--primary)" : "var(--border)",
                borderWidth: 2,
                boxShadow: isSelected ? "0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent)" : "none",
                transition: "border-color 120ms ease, box-shadow 120ms ease",
              }}
            >
              <input
                type="radio"
                name="packageId"
                value={p.id}
                checked={isSelected}
                onChange={() => setSelectedId(p.id)}
                style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              />
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", margin: 0, fontSize: 22, letterSpacing: "-0.02em" }}>
                  {p.name}
                </h3>
                {p.description ? (
                  <p className="muted" style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.55 }}>
                    {p.description}
                  </p>
                ) : null}
              </div>
              {p.includes.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                  {p.includes.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontSize: 13,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: "var(--primary)", fontWeight: 800 }}>·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 14,
                  borderTop: "1px solid var(--border)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: isSelected ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {isSelected ? "✓ Seleccionado" : "Seleccionar"}
              </div>
            </label>
          )
        })}
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Invitados aproximados</label>
          <input name="guestCount" type="number" min={1} step="1" placeholder="150" />
        </div>
        <div className="field">
          <label>Tipo de evento (opcional)</label>
          <select name="venueType" defaultValue="">
            <option value="">Selecciona...</option>
            <option value="boda">Boda</option>
            <option value="corporativo">Evento corporativo</option>
            <option value="cumpleanos">Cumpleaños</option>
            <option value="aniversario">Aniversario</option>
            <option value="graduacion">Graduación</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>
    </div>
  )
}
