export function Step4Contact() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Datos de contacto
        </h2>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Te contactaremos por WhatsApp con la cotización personalizada y el siguiente paso.
        </p>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Nombre completo</label>
          <input name="clientName" placeholder="¿Cómo te llamas?" />
        </div>
        <div className="field">
          <label>Teléfono / WhatsApp</label>
          <input name="clientPhone" type="tel" placeholder="55 1234 5678" />
        </div>
        <div className="field">
          <label>Email (opcional)</label>
          <input name="clientEmail" type="email" placeholder="tu@correo.com" autoComplete="off" />
        </div>
        <div className="field">
          <label>WhatsApp distinto al teléfono (opcional)</label>
          <input name="clientWhatsapp" placeholder="521..." />
        </div>
      </div>

      <div className="field">
        <label>Cualquier detalle que quieras compartir (opcional)</label>
        <textarea
          name="notes"
          placeholder="Repertorio que te gustaría, momentos especiales, dudas..."
          style={{ minHeight: 120 }}
        />
      </div>
    </div>
  )
}
