"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintButton({ label = "Imprimir / PDF" }: { label?: string }) {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()} className="gap-1.5">
      <Printer className="w-3.5 h-3.5" />
      {label}
    </Button>
  )
}
