"use client"

import { useState } from "react"

export function CopyLinkButton({ url, label = "Copiar link de firma" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback: select text in a temporary input
      const input = document.createElement("input")
      input.value = url
      document.body.appendChild(input)
      input.select()
      try {
        document.execCommand("copy")
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      } catch {
        /* give up */
      }
      input.remove()
    }
  }

  return (
    <button
      type="button"
      className="button secondary"
      onClick={onCopy}
      style={{ padding: "8px 14px", fontSize: 13 }}
    >
      {copied ? "✓ Copiado" : label}
    </button>
  )
}
