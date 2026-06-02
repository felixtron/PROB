import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { AdminSignContractForm } from "@/components/admin/AdminSignContractForm"
import { PrintButton } from "@/components/admin/PrintButton"
import { CopyLinkButton } from "@/components/admin/CopyLinkButton"
import { voidContractAction } from "@/app/admin/ventas/[id]/contrato/actions"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  signed_admin: "Firmado por prestador",
  signed_client: "Firmado por cliente",
  signed_both: "Firmado por ambas partes",
  void: "Anulado",
}

const STATUS_BADGE: Record<string, string> = {
  draft: "badge warn",
  signed_admin: "badge warn",
  signed_client: "badge warn",
  signed_both: "badge ok",
  void: "badge err",
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
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Link href={`/admin/ventas/${booking.id}`} className="muted" style={{ textDecoration: "none", fontSize: 13 }}>
            ← Booking <code>{booking.shortCode}</code>
          </Link>
          <h1 style={{ fontSize: 28, margin: "8px 0 4px" }}>Contrato</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            <span className={STATUS_BADGE[contract.status] ?? "badge muted"}>
              {STATUS_LABELS[contract.status] ?? contract.status}
            </span>
            {" · "}emitido {contract.createdAt.toISOString().slice(0, 10)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {contract.status !== "void" && !contract.clientSignedAt ? (
            <CopyLinkButton url={signUrl} />
          ) : null}
          <PrintButton />
          {contract.status !== "void" && contract.status !== "signed_both" ? (
            <form action={voidContractAction} style={{ display: "inline" }}>
              <input type="hidden" name="contractId" value={contract.id} />
              <input type="hidden" name="bookingId" value={booking.id} />
              <button
                className="button secondary"
                type="submit"
                style={{ padding: "8px 14px", fontSize: 13, color: "#fb7185", borderColor: "rgba(251,113,133,0.4)" }}
              >
                Anular contrato
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="card" style={{ padding: 32, fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.7 }} id="print">
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            fontSize: 15,
            color: "var(--foreground)",
          }}
        >
{contract.legalSnapshot}
        </pre>

        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            display: "grid",
            gap: 14,
            fontFamily: "var(--font-sans, system-ui)",
            fontSize: 13,
          }}
        >
          <div>
            <strong>EL PRESTADOR · firma electrónica:</strong>
            {contract.adminSignedAt ? (
              <span className="muted">
                {" "}{contract.adminSignerName} · {contract.adminSignedAt.toISOString().replace("T", " ").slice(0, 19)} UTC
              </span>
            ) : (
              <span className="muted"> pendiente</span>
            )}
          </div>
          <div>
            <strong>EL CLIENTE · firma electrónica:</strong>
            {contract.clientSignedAt ? (
              <>
                {" "}
                <span className="muted">
                  {contract.clientSignerName} · {contract.clientSignedAt.toISOString().replace("T", " ").slice(0, 19)} UTC
                </span>
                {contract.clientSignatureDataUrl ? (
                  <div style={{ marginTop: 10, background: "#ffffff", padding: 10, borderRadius: 8, display: "inline-block" }}>
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
              <span className="muted"> pendiente · el cliente firma desde el link que le mandamos por WhatsApp</span>
            )}
          </div>
        </div>
      </div>

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
        .admin-shell > aside,
        header.page-shell,
        .button,
        [role="alert"] { display: none !important; }
        .admin-shell { grid-template-columns: 1fr !important; padding: 0 !important; }
        body, html { background: #fff !important; color: #000 !important; }
        #print { box-shadow: none !important; border: none !important; padding: 0 !important; }
        #print pre { color: #000 !important; }
      }
    `}</style>
  )
}
