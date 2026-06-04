import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { startDepositCheckoutAction } from "@/app/cotizar/exito/[shortCode]/actions"

export const dynamic = "force-dynamic"

type CancelPageProps = {
  params: Promise<{ shortCode: string }>
}

export default async function PaymentCanceledPage({ params }: CancelPageProps) {
  const tenant = await resolveCurrentTenant()
  const { shortCode } = await params

  const booking = await db.bookingRequest.findFirst({
    where: { shortCode: shortCode.toUpperCase(), tenantId: tenant.id },
    select: {
      shortCode: true,
      clientName: true,
      packageName: true,
      requestedDate: true,
      baseAmount: true,
      depositAmount: true,
    },
  })
  if (!booking) notFound()

  const dateLabel = booking.requestedDate
    ? booking.requestedDate.toISOString().slice(0, 10)
    : "Por confirmar"
  const depositAmount = booking.depositAmount > 0 ? booking.depositAmount : booking.baseAmount
  const moneyFmt = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: tenant.currency.toUpperCase(),
    maximumFractionDigits: 0,
  })
  const depositLabel = moneyFmt.format(depositAmount / 100)

  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div
        style={{
          width: 72,
          height: 72,
          margin: "0 auto",
          borderRadius: "50%",
          background: "rgba(251,191,36,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          color: "#d97706",
        }}
      >
        ⚠
      </div>

      <div>
        <p
          className="muted"
          style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.18em", margin: 0, fontSize: 11 }}
        >
          Pago cancelado
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
          Aún puedes reservar.
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
          Tu cotización <strong>{booking.shortCode}</strong> sigue activa, pero la fecha del{" "}
          <strong>{dateLabel}</strong> no está garantizada hasta recibir el anticipo. ¿Quieres reintentar el pago?
        </p>
      </div>

      <form action={startDepositCheckoutAction}>
        <input type="hidden" name="shortCode" value={booking.shortCode} />
        <button
          type="submit"
          className="button"
          style={{ padding: "16px 28px", fontSize: 15, fontWeight: 800, letterSpacing: "0.04em" }}
        >
          Reintentar pago de {depositLabel} →
        </button>
      </form>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href={`/cotizar/exito/${booking.shortCode}`}
          className="button secondary"
          style={{ padding: "12px 22px", fontSize: 13, textDecoration: "none" }}
        >
          Volver al detalle
        </Link>
        {tenant.whatsapp ? (
          <a
            href={`https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hola, soy ${booking.clientName}. Tengo dudas sobre el pago de la cotización ${booking.shortCode}.`,
            )}`}
            target="_blank"
            rel="noopener"
            className="button secondary"
            style={{ padding: "12px 22px", fontSize: 13, textDecoration: "none" }}
          >
            Hablar por WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  )
}
