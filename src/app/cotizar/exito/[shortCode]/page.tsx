import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"

export const dynamic = "force-dynamic"

type SuccessPageProps = {
  params: Promise<{ shortCode: string }>
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const tenant = await resolveCurrentTenant()
  const { shortCode } = await params

  // Look up scoped to this tenant (defense: someone with a code from tenant A
  // shouldn't be able to read it via tenant B's domain).
  const booking = await db.bookingRequest.findFirst({
    where: { shortCode: shortCode.toUpperCase(), tenantId: tenant.id },
    select: {
      shortCode: true,
      clientName: true,
      packageName: true,
      requestedDate: true,
      city: true,
      state: true,
      status: true,
      createdAt: true,
    },
  })
  if (!booking) notFound()

  const dateLabel = booking.requestedDate
    ? booking.requestedDate.toISOString().slice(0, 10)
    : "Por confirmar"
  const waLink = tenant.whatsapp
    ? `https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hola, soy ${booking.clientName}. Acabo de enviar la cotización ${booking.shortCode}.`,
      )}`
    : null

  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div>
        <p
          className="muted"
          style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.18em", margin: 0, fontSize: 11 }}
        >
          Solicitud recibida
        </p>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 42,
            margin: "12px 0 14px",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          Gracias, {booking.clientName.split(" ")[0]}.
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
          Recibimos tu solicitud. Nos pondremos en contacto contigo en menos de 24 horas con la cotización
          personalizada.
        </p>
      </div>

      <div
        className="card"
        style={{
          padding: 28,
          display: "grid",
          gap: 18,
          textAlign: "left",
          borderColor: "var(--primary)",
          borderWidth: 2,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            className="muted"
            style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.18em", fontSize: 10, margin: 0 }}
          >
            Código de seguimiento
          </p>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 32,
              letterSpacing: "0.2em",
              margin: "6px 0 0",
              color: "var(--primary)",
            }}
          >
            {booking.shortCode}
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gap: 10 }}>
          <Row label="Paquete" value={booking.packageName ?? "—"} />
          <Row label="Fecha" value={dateLabel} />
          {(booking.city || booking.state) ? (
            <Row label="Lugar" value={[booking.city, booking.state].filter(Boolean).join(", ")} />
          ) : null}
          <Row label="Status" value="Pendiente de revisión" />
        </div>
      </div>

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

      <p className="muted" style={{ margin: 0, fontSize: 12 }}>
        Guarda tu código <strong style={{ color: "var(--foreground)" }}>{booking.shortCode}</strong> para hacer
        seguimiento. {tenant.email ? `Si tienes dudas, escríbenos a ${tenant.email}.` : null}
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <span className="muted" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  )
}
