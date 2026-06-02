import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ shortToken: string }>
}

export default async function SignSuccessPage({ params }: PageProps) {
  const tenant = await resolveCurrentTenant()
  const { shortToken } = await params

  const contract = await db.contract.findFirst({
    where: { shortToken, tenantId: tenant.id },
    include: { bookingRequest: { select: { clientName: true, shortCode: true } } },
  })
  if (!contract) notFound()

  const signed = Boolean(contract.clientSignedAt)
  const waLink = tenant.whatsapp
    ? `https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hola, soy ${contract.bookingRequest?.clientName ?? ""}. Acabo de firmar el contrato.`,
      )}`
    : null

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
      <div>
        <p
          className="muted"
          style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.18em", margin: 0, fontSize: 11 }}
        >
          {signed ? "Firmado" : "Contrato registrado"}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 38,
            margin: "12px 0 14px",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
          }}
        >
          {signed ? "¡Listo!" : "Recibido"}
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
          {signed
            ? "Tu firma quedó registrada con fecha y hora. Te enviamos una copia por WhatsApp."
            : "Hemos recibido tu solicitud."}
        </p>
      </div>

      {signed && contract.clientSignatureDataUrl ? (
        <div
          className="card"
          style={{
            padding: 20,
            display: "grid",
            gap: 12,
            background: "#ffffff",
            color: "#0b1220",
            borderColor: "var(--primary)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Tu firma
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL */}
          <img
            src={contract.clientSignatureDataUrl}
            alt="Firma del cliente"
            style={{ width: "100%", maxWidth: 320, margin: "0 auto", borderBottom: "2px solid #0b1220", paddingBottom: 6 }}
          />
          <p style={{ margin: 0, fontSize: 13 }}>
            <strong>{contract.clientSignerName}</strong>
            <br />
            <span style={{ color: "#64748b", fontSize: 11 }}>
              {contract.clientSignedAt?.toISOString().replace("T", " ").slice(0, 19)} UTC
            </span>
          </p>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener"
            className="button"
            style={{ padding: "14px 24px", fontSize: 14, textDecoration: "none" }}
          >
            Escribir por WhatsApp
          </a>
        ) : null}
        <Link
          href="/cotizar"
          className="button secondary"
          style={{ padding: "14px 24px", fontSize: 14, textDecoration: "none" }}
        >
          Cotizar otro evento
        </Link>
      </div>
    </div>
  )
}
