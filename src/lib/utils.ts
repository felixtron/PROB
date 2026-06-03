import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateMX(dateInput: Date | string | null | undefined, formatStr: string = "PPP") {
  if (!dateInput) return ""

  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput

    if (!d || !isValid(d) || isNaN(d.getTime())) return ""

    // ESTRATEGIA ANTIDESFASE: fechas guardadas a 00:00 UTC restan 6h en MX y brincan
    // al día anterior. Forzar mediodía UTC mantiene el día correcto en la zona MX.
    const utcHours = d.getUTCHours()
    if (utcHours < 10) {
      const safeDate = new Date(d)
      safeDate.setUTCHours(12, 0, 0, 0)
      return format(safeDate, formatStr, { locale: es })
    }

    return format(d, formatStr, { locale: es })
  } catch {
    return ""
  }
}

export function formatTimeMX(dateInput: Date | string | null | undefined) {
  if (!dateInput) return "--:--"
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return d.toLocaleTimeString("es-MX", {
      timeZone: "America/Mexico_City",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } catch {
    return "--:--"
  }
}

export function formatDateTimeMX(dateInput: Date | string | null | undefined) {
  if (!dateInput) return ""
  const datePart = formatDateMX(dateInput, "d 'de' MMM")
  const timePart = formatTimeMX(dateInput)
  return `${datePart}, ${timePart}`
}

export function formatCurrencyMX(amount: number) {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amount || 0)
  } catch {
    return "$0"
  }
}
