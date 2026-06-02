// Default contract template used when a tenant has not customized
// `tenant.contractLegalText`. Bug fix vs Vendetta: the RFC and the
// legal name come from the per-tenant fields (legalRfc, legalName) —
// they are NOT hardcoded anywhere in the codebase.

export const DEFAULT_CONTRACT_TEMPLATE = `CONTRATO DE PRESTACIÓN DE SERVICIOS MUSICALES

Entre {{tenantLegalName}}{{tenantLegalRfc?, con RFC {{tenantLegalRfc}}}}, en adelante "EL PRESTADOR",
y {{clientName}}, en adelante "EL CLIENTE", se acuerdan las siguientes condiciones:

EVENTO
Paquete: {{packageName}}
Fecha: {{eventDate}}
Horario: {{startTime}} a {{endTime}}
Lugar: {{address}}{{city?, {{city}}}}{{state?, {{state}}}}
Invitados: {{guestCount}}

MONTOS (MXN)
Total acordado: {{baseAmount}}
Anticipo a entregar al firmar: {{depositAmount}}
Saldo a cubrir el día del evento: {{balanceAmount}}

CLÁUSULAS
1. EL PRESTADOR se compromete a brindar el servicio musical en la fecha, horario y lugar acordados.
2. EL CLIENTE se compromete a pagar el monto total acordado, con el anticipo señalado al momento de la firma.
3. La cancelación con menos de 30 días de anticipación no tiene reembolso del anticipo.
4. Cambios de fecha quedan sujetos a disponibilidad de EL PRESTADOR.
5. Las condiciones técnicas (energía eléctrica, espacio, accesos) son responsabilidad de EL CLIENTE.

Lugar y fecha: {{signedDateLabel}}

FIRMAS

_______________________________
EL PRESTADOR
{{tenantLegalName}}

_______________________________
EL CLIENTE
{{clientName}}
`

export type ContractVars = {
  tenantLegalName: string
  tenantLegalRfc: string
  clientName: string
  packageName: string
  eventDate: string
  startTime: string
  endTime: string
  address: string
  city: string
  state: string
  guestCount: string
  baseAmount: string
  depositAmount: string
  balanceAmount: string
  signedDateLabel: string
}

// Substitutes {{var}} and supports a tiny conditional syntax for optional bits:
// {{varName?, prefix {{varName}} suffix}} renders the prefix + value + suffix
// only if varName is non-empty; otherwise it renders nothing.
export function renderContractTemplate(template: string, vars: ContractVars): string {
  // First pass: conditional blocks  {{name?, text containing {{name}}}}
  let out = template.replace(/\{\{\s*(\w+)\?,\s*([^}]*\{\{\s*\1\s*\}\}[^}]*)\}\}/g, (_, name: string, inner: string) => {
    const v = vars[name as keyof ContractVars]
    if (!v || v.trim() === "") return ""
    return inner
  })
  // Second pass: plain variables {{name}}
  out = out.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
    const v = vars[name as keyof ContractVars]
    return v ?? match
  })
  return out
}

const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateContractToken(): string {
  let s = ""
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < 12; i++) s += TOKEN_ALPHABET[bytes[i] % TOKEN_ALPHABET.length]
  return s
}
