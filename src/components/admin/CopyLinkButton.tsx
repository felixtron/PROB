"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <Button
      type="button"
      variant="outline"
      onClick={onCopy}
      className={copied ? "gap-1.5 text-green-600 border-green-600/30" : "gap-1.5"}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copiado" : label}
    </Button>
  )
}
