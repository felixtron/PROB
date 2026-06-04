import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"

export const dynamic = "force-dynamic"

type PaymentSuccessPageProps = {
  params: Promise<{ shortCode: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function PaymentSuccessPage({ params, searchParams }: PaymentSuccessPageProps) {
  const tenant = await resolveCurrentTenant()
  const { shortCode } = await params
  await searchParams

  // Re-read the booking via the tenant-scoped query so we don't leak across tenants.
  const booking = await db.bookingRequest.findFirst({
    where: { shortCode: shortCode.toUpperCase(), tenantId: tenant.id },
    select: {
      shortCode: true,
      clientName: true,
      packageName: true,
      requestedDate: true,
      paymentStatus: true,
    },
  })
  if (!booking) notFound()

  const dateLabel = booking.requestedDate
    ? booking.requestedDate.toISOString().slice(0, 10)
    : "Por confirmar"

  // Status reflects what we know LOCALLY. The webhook may still be processing
  // (Stripe success page redirects before the webhook fires). We tell the user
  // their payment is being confirmed and to wait a moment if not yet visible.
  const confirmed = booking.paymentStatus === "completed"

  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div
        style={{
          width: 72,
          height: 72,
          margin: "0 auto",
          borderRadius: "50%",
          background: confirmed ? "rgba(134,239,172,0.15)" : "rgba(96,165,250,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          color: confirmed ? "#16a34a" : "#3b82f6",
        }}
      >
        {confirmed ? "✓" : "⏳"}
      </div>

      <div>
        <p
          className="muted"
          style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.18em", margin: 0, fontSize: 11 }}
        >
          Pago recibido
        </p>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 38,
            margin: "12px 0 14px",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          {confirmed
            ? `¡Tu fecha está reservada, ${booking.clientName.split(" ")[0]}!`
            : "Confirmando tu pago…"}
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
          {confirmed
            ? `Recibimos el anticipo para tu evento del ${dateLabel}. En las próximas horas te enviaremos la confirmación con todos los detalles.`
            : "Tu pago se procesó correctamente en Stripe. Estamos terminando de actualizar tu reserva — esto toma unos segundos. Si después de un minuto sigue sin confirmar, contáctanos."}
        </p>
      </div>

      <div
        className="card"
        style={{
          padding: 22,
          textAlign: "left",
          display: "grid",
          gap: 10,
          borderColor: confirmed ? "rgba(134,239,172,0.5)" : "var(--border)",
        }}
      >
        <Row label="Código de reserva" value={booking.shortCode} mono />
        <Row label="Paquete" value={booking.packageName ?? "—"} />
        <Row label="Fecha del evento" value={dateLabel} />
        <Row label="Status" value={confirmed ? "Reservado · anticipo pagado" : "Procesando pago"} />
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href={`/cotizar/exito/${booking.shortCode}`}
          className="button secondary"
          style={{ padding: "14px 24px", fontSize: 14, textDecoration: "none" }}
        >
          Ver detalles
        </Link>
        {tenant.whatsapp ? (
          <a
            href={`https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hola, soy ${booking.clientName}. Acabo de pagar el anticipo de la cotización ${booking.shortCode}.`,
            )}`}
            target="_blank"
            rel="noopener"
            className="button"
            style={{ padding: "14px 24px", fontSize: 14, textDecoration: "none" }}
          >
            Avisarles por WhatsApp
          </a>
        ) : null}
      </div>

      <p className="muted" style={{ margin: 0, fontSize: 12 }}>
        {tenant.email
          ? `Cualquier duda escríbenos a ${tenant.email}.`
          : "Conservamos tu información para procesar tu reserva."}
      </p>
    </div>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <span className="muted" style={{ fontSize: 13 }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          fontFamily: mono ? "var(--font-heading)" : undefined,
          letterSpacing: mono ? "0.15em" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  )
}
