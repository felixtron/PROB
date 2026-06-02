export function Step3Date() {
  // Compute tomorrow as the min selectable date (booking the same day is unrealistic).
  // Note: this runs on the client when first rendered; SSR will get the server's "today".
  // For UX it's fine — the server-side schema only requires the field to be present.
  const today = new Date()
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 10)

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          ¿Cuándo es?
        </h2>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Fecha y horarios aproximados. Si necesitas algo el mismo día, mejor escríbenos por WhatsApp.
        </p>
      </div>

      <div className="field">
        <label>Fecha</label>
        <input name="requestedDate" type="date" min={minDate} />
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Hora de inicio</label>
          <input name="startTime" type="time" defaultValue="20:00" />
        </div>
        <div className="field">
          <label>Hora de fin</label>
          <input name="endTime" type="time" defaultValue="00:00" />
        </div>
      </div>
    </div>
  )
}
