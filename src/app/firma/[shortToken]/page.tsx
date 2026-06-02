import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ClientSignForm } from "@/components/firma/ClientSignForm"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ shortToken: string }>
}

export default async function SignContractPage({ params }: PageProps) {
  const tenant = await resolveCurrentTenant()
  const { shortToken } = await params

  const contract = await db.contract.findFirst({
    where: { shortToken, tenantId: tenant.id },
    include: { bookingRequest: { select: { clientName: true, shortCode: true } } },
  })
  if (!contract) notFound()

  // If already signed by client, send them to success — they can re-print/download.
  if (contract.clientSignedAt) {
    redirect(`/firma/${shortToken}/exito`)
  }

  if (contract.status === "void") {
    return (
      <div style={{ display: "grid", gap: 24, textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, margin: 0 }}>Contrato anulado</h1>
        <p className="muted" style={{ margin: 0 }}>
          Este contrato fue cancelado. Si crees que es un error, escribe a{" "}
          {tenant.email ? <a href={`mailto:${tenant.email}`}>{tenant.email}</a> : "el prestador del servicio"}.
        </p>
        <div>
          <Link href="/cotizar" className="button secondary" style={{ padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>
            Volver a cotizar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div style={{ textAlign: "center" }}>
        <p
          className="muted"
          style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.18em", margin: 0, fontSize: 11 }}
        >
          Firma del contrato
        </p>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 36,
            margin: "12px 0 14px",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
          }}
        >
          Confirma tu contrato
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
          Lee el documento, firma con tu nombre completo y queda registrado con fecha y hora.
          {contract.bookingRequest ? (
            <>
              {" Booking "}<code>{contract.bookingRequest.shortCode}</code>.
            </>
          ) : null}
        </p>
      </div>

      <div
        className="card"
        style={{
          padding: 28,
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: 1.65,
          maxHeight: 460,
          overflow: "auto",
        }}
      >
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            fontSize: 14,
            color: "var(--foreground)",
          }}
        >
{contract.legalSnapshot}
        </pre>
      </div>

      <ClientSignForm
        shortToken={contract.shortToken}
        defaultName={contract.bookingRequest?.clientName ?? ""}
      />
    </div>
  )
}
