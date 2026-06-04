import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText, Ban } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { AdminSignContractForm } from "@/components/admin/AdminSignContractForm"
import { PrintButton } from "@/components/admin/PrintButton"
import { CopyLinkButton } from "@/components/admin/CopyLinkButton"
import { voidContractAction } from "@/app/admin/ventas/[id]/contrato/actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  signed_admin: "Firmado por prestador",
  signed_client: "Firmado por cliente",
  signed_both: "Firmado por ambas partes",
  void: "Anulado",
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "signed_both":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "void":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    default:
      return "text-yellow-600 border-yellow-600/40 bg-yellow-600/5"
  }
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ContractPage({ params }: PageProps) {
  const tenant = await resolveCurrentTenant()
  const { id } = await params

  const booking = await db.bookingRequest.findFirst({
    where: { id, tenantId: tenant.id },
    include: { contract: true },
  })
  if (!booking || !booking.contract) notFound()
  const contract = booking.contract

  const reqHeaders = await headers()
  const host = reqHeaders.get("x-tenant-host") ?? reqHeaders.get("host") ?? ""
  const isLocal = host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("::1")
  const protocol = isLocal ? "http" : "https"
  const signUrl = host ? `${protocol}://${host}/firma/${contract.shortToken}` : `/firma/${contract.shortToken}`

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <Link href={`/admin/ventas/${booking.id}`} className="no-underline inline-block mb-4">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Booking <code className="ml-1 font-mono text-xs">{booking.shortCode}</code>
          </Button>
        </Link>
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Contrato</h1>
              <Badge variant="outline" className={statusBadgeClass(contract.status)}>
                {STATUS_LABELS[contract.status] ?? contract.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Emitido <span className="font-mono">{contract.createdAt.toISOString().slice(0, 10)}</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {contract.status !== "void" && !contract.clientSignedAt ? (
              <CopyLinkButton url={signUrl} />
            ) : null}
            <PrintButton />
            {contract.status !== "void" && contract.status !== "signed_both" ? (
              <form action={voidContractAction} className="inline">
                <input type="hidden" name="contractId" value={contract.id} />
                <input type="hidden" name="bookingId" value={booking.id} />
                <Button type="submit" variant="destructive" className="gap-1.5">
                  <Ban className="w-3.5 h-3.5" />
                  Anular contrato
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      <Card className="bg-white p-10 mb-6 leading-relaxed" id="print">
        <pre
          className="m-0 whitespace-pre-wrap text-foreground"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          {contract.legalSnapshot}
        </pre>

        <div className="mt-8 pt-6 border-t border-border space-y-4 text-sm">
          <div>
            <strong>EL PRESTADOR · firma electrónica:</strong>
            {contract.adminSignedAt ? (
              <span className="text-muted-foreground">
                {" "}{contract.adminSignerName} ·{" "}
                <span className="font-mono">{contract.adminSignedAt.toISOString().replace("T", " ").slice(0, 19)} UTC</span>
              </span>
            ) : (
              <span className="text-muted-foreground"> pendiente</span>
            )}
          </div>
          <div>
            <strong>EL CLIENTE · firma electrónica:</strong>
            {contract.clientSignedAt ? (
              <>
                {" "}
                <span className="text-muted-foreground">
                  {contract.clientSignerName} ·{" "}
                  <span className="font-mono">{contract.clientSignedAt.toISOString().replace("T", " ").slice(0, 19)} UTC</span>
                </span>
                {contract.clientSignatureDataUrl ? (
                  <div className="mt-3 bg-white p-2.5 rounded-lg inline-block border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL */}
                    <img
                      src={contract.clientSignatureDataUrl}
                      alt={`Firma de ${contract.clientSignerName}`}
                      style={{ maxWidth: 280, maxHeight: 100, display: "block" }}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <span className="text-muted-foreground">
                {" "}pendiente · el cliente firma desde el link que le mandamos por WhatsApp
              </span>
            )}
          </div>
        </div>
      </Card>

      {contract.status !== "void" && !contract.adminSignedAt ? (
        <AdminSignContractForm
          contractId={contract.id}
          bookingId={booking.id}
          defaultName={tenant.legalName || tenant.name}
        />
      ) : null}

      <PrintStyles />
    </div>
  )
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        aside,
        header,
        button,
        [role="alert"] { display: none !important; }
        body, html { background: #fff !important; color: #000 !important; }
        #print { box-shadow: none !important; border: none !important; padding: 0 !important; }
        #print pre { color: #000 !important; }
      }
    `}</style>
  )
}
