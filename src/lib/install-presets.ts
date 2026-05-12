import type { InstallInput } from "@/lib/install-schema"

type PackageSeed = {
  name: string
  description: string
  basePrice: number
  minDuration: number
  includes: string[]
}

export function getPackagePreset(type: InstallInput["packagePreset"]): PackageSeed[] {
  if (type === "blank") return []

  if (type === "dj") {
    return [
      {
        name: "DJ Set",
        description: "Servicio base de DJ para eventos sociales y corporativos.",
        basePrice: 12000,
        minDuration: 4,
        includes: ["DJ profesional", "Controladora", "Audio base", "Iluminación básica"],
      },
    ]
  }

  if (type === "artist") {
    return [
      {
        name: "Show Acústico",
        description: "Presentación íntima para eventos privados.",
        basePrice: 18000,
        minDuration: 1,
        includes: ["Artista principal", "Backline básico", "Setlist curado"],
      },
    ]
  }

  if (type === "agency") {
    return [
      {
        name: "Producción Personalizada",
        description: "Paquete abierto para cotizar producción, talento y logística.",
        basePrice: 0,
        minDuration: 1,
        includes: ["Asesoría", "Diseño de show", "Cotización por alcance"],
      },
    ]
  }

  return [
    {
      name: "Show Completo",
      description: "Presentación de banda para evento social o corporativo.",
      basePrice: 35000,
      minDuration: 2,
      includes: ["Banda completa", "Audio profesional", "Setlist personalizable", "Coordinación previa"],
    },
    {
      name: "Show Premium",
      description: "Experiencia extendida con producción reforzada.",
      basePrice: 55000,
      minDuration: 3,
      includes: ["Banda completa", "Audio e iluminación", "DJ intermedio", "Coordinación integral"],
    },
  ]
}

export const defaultMessageTemplates = [
  {
    key: "quote_received",
    label: "Cotización recibida",
    content: "Hola {{clientName}}, recibimos tu solicitud para {{eventDate}}. En breve te contactamos.",
  },
  {
    key: "event_confirmed",
    label: "Evento confirmado",
    content: "Tu evento {{folio}} quedó confirmado. Gracias por confiar en {{organizationName}}.",
  },
  {
    key: "musician_call",
    label: "Convocatoria de músico",
    content: "Nuevo evento: {{eventDate}} en {{location}}. Confirma tu disponibilidad.",
  },
]
