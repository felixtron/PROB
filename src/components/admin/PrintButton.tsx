"use client"

export function PrintButton({ label = "Imprimir / PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      className="button secondary"
      onClick={() => window.print()}
      style={{ padding: "8px 14px", fontSize: 13 }}
    >
      {label}
    </button>
  )
}
