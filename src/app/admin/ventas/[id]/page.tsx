import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { BookingDetailForm } from "@/components/admin/BookingDetailForm"
import { deleteBookingAction } from "@/app/admin/ventas/actions"
import { issueContractAction } from "@/app/admin/ventas/[id]/contrato/actions"

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  signed_admin: "Firmado por prestador",
  signed_client: "Firmado por cliente",
  signed_both: "Firmado por ambas partes",
  void: "Anulado",
}

const CONTRACT_STATUS_BADGE: Record<string, string> = {
  draft: "badge warn",
  signed_admin: "badge warn",
  signed_client: "badge warn",
  signed_both: "badge ok",
  void: "badge err",
}

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  expired: "Expirado",
}

type DetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: DetailPageProps) {
  const tenant = await resolveCurrentTenant()
  const { id } = await params

  const booking = await db.bookingRequest.findFirst({
    where: { id, tenantId: tenant.id },
    include: { client: true, contract: true },
  })
  if (!booking) notFound()

  const [clients, packages] = await Promise.all([
    db.clientProfile.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.servicePackage.findMany({
      where: { tenantId: tenant.id, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Link href="/admin/ventas" className="muted" style={{ textDecoration: "none", fontSize: 13 }}>
            ← Centro de Ventas
          </Link>
          <h1 style={{ fontSize: 28, margin: "8px 0 4px" }}>
            <code style={{ fontSize: 22 }}>{booking.shortCode}</code>
            <span className="muted" style={{ fontSize: 14, marginLeft: 12 }}>
              · {STATUS_LABELS[booking.status] ?? booking.status}
            </span>
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Creado {booking.createdAt.toISOString().slice(0, 10)} · origen{" "}
            <code>{booking.source}</code>
            {booking.client ? (
              <>
                {" · "}
                <Link href="/admin/clientes" style={{ textDecoration: "underline" }}>
                  cliente del CRM: {booking.client.name}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <form action={deleteBookingAction}>
          <input type="hidden" name="id" value={booking.id} />
          <button
            className="button secondary"
            type="submit"
            style={{ color: "#fb7185", borderColor: "rgba(251,113,133,0.4)" }}
          >
            Eliminar booking
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: 14 }}>Contrato</strong>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            {booking.contract ? (
              <>
                <span className={CONTRACT_STATUS_BADGE[booking.contract.status] ?? "badge muted"}>
                  {CONTRACT_STATUS_LABELS[booking.contract.status] ?? booking.contract.status}
                </span>
                {" · "}emitido {booking.contract.createdAt.toISOString().slice(0, 10)}
              </>
            ) : (
              "No emitido"
            )}
          </div>
        </div>
        {booking.contract ? (
          <Link href={`/admin/ventas/${booking.id}/contrato`} className="button">
            Ver / firmar contrato
          </Link>
        ) : (
          <form action={issueContractAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button className="button" type="submit">Emitir contrato</button>
          </form>
        )}
      </div>

      <BookingDetailForm
        booking={{
          id: booking.id,
          clientId: booking.clientId,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          clientPhone: booking.clientPhone,
          clientWhatsapp: booking.clientWhatsapp,
          packageId: booking.packageId,
          packageName: booking.packageName,
          guestCount: booking.guestCount,
          venueType: booking.venueType,
          address: booking.address,
          city: booking.city,
          state: booking.state,
          mapsLink: booking.mapsLink,
          requestedDateISO: booking.requestedDate ? booking.requestedDate.toISOString().slice(0, 10) : null,
          startTime: booking.startTime,
          endTime: booking.endTime,
          baseAmountUnits: booking.baseAmount / 100,
          depositAmountUnits: booking.depositAmount / 100,
          paymentMethod: booking.paymentMethod,
          paymentStatus: booking.paymentStatus,
          status: booking.status,
          adminNote: booking.adminNote,
        }}
        clients={clients}
        packages={packages}
      />
    </div>
  )
}
