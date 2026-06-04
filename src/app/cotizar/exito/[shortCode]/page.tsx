import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { startDepositCheckoutAction } from "@/app/cotizar/exito/[shortCode]/actions"

export const dynamic = "force-dynamic"

type SuccessPageProps = {
  params: Promise<{ shortCode: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const tenant = await resolveCurrentTenant()
  const { shortCode } = await params
  const { error } = await searchParams

  const booking = await db.bookingRequest.findFirst({
    where: { shortCode: shortCode.toUpperCase(), tenantId: tenant.id },
    select: {
      id: true,
      shortCode: true,
      clientName: true,
      packageName: true,
      requestedDate: true,
      city: true,
      state: true,
      status: true,
      paymentStatus: true,
      baseAmount: true,
      depositAmount: true,
      createdAt: true,
    },
  })
  if (!booking) notFound()

  const settings = await db.integrationSettings.findUnique({
    where: { tenantId: tenant.id },
    select: { stripeEnabled: true, stripeSecretKey: true },
  })
  const stripeAvailable = Boolean(settings?.stripeSecretKey)

  const dateLabel = booking.requestedDate
    ? booking.requestedDate.toISOString().slice(0, 10)
    : "Por confirmar"
  const waLink = tenant.whatsapp
    ? `https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hola, soy ${booking.clientName}. Acabo de enviar la cotización ${booking.shortCode}.`,
      )}`
    : null

  const depositAmount = booking.depositAmount > 0 ? booking.depositAmount : booking.baseAmount
  const moneyFmt = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: tenant.currency.toUpperCase(),
    maximumFractionDigits: 0,
  })
  const depositLabel = moneyFmt.format(depositAmount / 100)

  const showPayButton = stripeAvailable && depositAmount > 0 && booking.paymentStatus !== "completed"

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

      {error ? (
        <div
          className="card"
          style={{
            padding: 14,
            borderColor: "rgba(251,113,133,0.4)",
            background: "rgba(251,113,133,0.05)",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#fb7185" }}>{error}</p>
        </div>
      ) : null}

      {booking.paymentStatus === "completed" ? (
        <div
          className="card"
          style={{
            padding: 18,
            borderColor: "rgba(134,239,172,0.5)",
            background: "rgba(134,239,172,0.05)",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: "#16a34a", fontWeight: 700 }}>
            ✓ Anticipo recibido. Tu evento está reservado.
          </p>
        </div>
      ) : null}

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
          <Row
            label="Status"
            value={
              booking.paymentStatus === "completed"
                ? "Reservado · anticipo pagado"
                : "Pendiente de revisión"
            }
          />
        </div>
      </div>

      {showPayButton ? (
        <div
          className="card"
          style={{
            padding: 24,
            display: "grid",
            gap: 14,
            textAlign: "center",
            borderColor: "rgba(96,165,250,0.4)",
            background: "rgba(96,165,250,0.04)",
          }}
        >
          <div>
            <p
              className="muted"
              style={{
                textTransform: "uppercase",
                fontWeight: 800,
                letterSpacing: "0.18em",
                margin: 0,
                fontSize: 10,
              }}
            >
              Reserva tu fecha ahora
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55 }}>
              Paga el anticipo de <strong>{depositLabel}</strong> con tarjeta y aseguramos la fecha. El saldo
              se cubre cerca del evento.
            </p>
          </div>
          <form action={startDepositCheckoutAction}>
            <input type="hidden" name="shortCode" value={booking.shortCode} />
            <button
              type="submit"
              className="button"
              style={{
                padding: "16px 28px",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.04em",
                width: "100%",
              }}
            >
              Pagar anticipo {depositLabel} →
            </button>
          </form>
          <p className="muted" style={{ margin: 0, fontSize: 11 }}>
            Pago seguro con Stripe. Aceptamos Visa, Mastercard, American Express.
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
