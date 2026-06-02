"use client"

import { useState } from "react"

export function QuickActionButton({
  label,
  comingSoon = true,
}: {
  label: string
  comingSoon?: boolean
}) {
  const [hint, setHint] = useState(false)

  function onClick() {
    if (comingSoon) {
      setHint(true)
      window.setTimeout(() => setHint(false), 2400)
    }
  }

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button type="button" className="button" onClick={onClick}>
        {label}
      </button>
      {hint ? (
        <span
          role="status"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          Próximamente — necesita modelos de Centro de Ventas (Fase 3b).
        </span>
      ) : null}
    </span>
  )
}
