const STEPS = ["Paquete", "Ubicación", "Fecha", "Contacto"] as const

export function FunnelStepper({ current }: { current: number }) {
  return (
    <ol
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
        gap: 8,
      }}
    >
      {STEPS.map((label, i) => {
        const isActive = i === current
        const isDone = i < current
        const accent = isActive || isDone ? "var(--primary)" : "var(--border)"
        const textColor = isActive ? "var(--primary)" : isDone ? "var(--foreground)" : "var(--muted-foreground)"
        return (
          <li key={label} style={{ display: "grid", gap: 8 }}>
            <div
              aria-hidden
              style={{
                height: 3,
                borderRadius: 2,
                background: accent,
                opacity: isActive || isDone ? 1 : 0.6,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: textColor,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: isActive || isDone ? "var(--primary)" : "transparent",
                  color: isActive || isDone ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  border: isActive || isDone ? "0" : "1px solid var(--border)",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                {i + 1}
              </span>
              <span>{label}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
