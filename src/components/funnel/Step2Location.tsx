export function Step2Location() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          ¿Dónde es el evento?
        </h2>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Esto nos ayuda a calcular logística y traslados.
        </p>
      </div>

      <div className="field">
        <label>Dirección del lugar</label>
        <input name="address" placeholder="Calle, número, colonia o nombre del salón" />
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Ciudad</label>
          <input name="city" placeholder="Ciudad de México" />
        </div>
        <div className="field">
          <label>Estado</label>
          <input name="state" placeholder="CDMX" />
        </div>
      </div>

      <div className="field">
        <label>Link de Google Maps (opcional)</label>
        <input name="mapsLink" placeholder="https://maps.app.goo.gl/..." />
      </div>
    </div>
  )
}
