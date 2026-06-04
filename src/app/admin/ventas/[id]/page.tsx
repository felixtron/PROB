import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText, Trash2 } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { BookingDetailForm } from "@/components/admin/BookingDetailForm"
import { deleteBookingAction } from "@/app/admin/ventas/actions"
import { issueContractAction } from "@/app/admin/ventas/[id]/contrato/actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  signed_admin: "Firmado por prestador",
  signed_client: "Firmado por cliente",
  signed_both: "Firmado por ambas partes",
  void: "Anulado",
}

function contractBadgeClass(status: string): string {
  switch (status) {
    case "signed_both":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "void":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    default:
      return "text-yellow-600 border-yellow-600/40 bg-yellow-600/5"
  }
}

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  expired: "Expirado",
}

function bookingStatusClass(status: string): string {
  switch (status) {
    case "confirmed":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "cancelled":
      return "bg-muted text-muted-foreground"
    case "expired":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    default:
      return "text-yellow-600 border-yellow-600/40 bg-yellow-600/5"
  }
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
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <Link href="/admin/ventas" className="no-underline inline-block mb-4">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Centro de Ventas
          </Button>
        </Link>
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <code className="text-2xl font-bold text-primary font-mono">{booking.shortCode}</code>
              <Badge variant="outline" className={bookingStatusClass(booking.status)}>
                {STATUS_LABELS[booking.status] ?? booking.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Creado <span className="font-mono">{booking.createdAt.toISOString().slice(0, 10)}</span> · origen{" "}
              <code className="px-1 py-0.5 rounded bg-muted text-xs">{booking.source}</code>
              {booking.client ? (
                <>
                  {" · "}
                  <Link href="/admin/clientes" className="underline">
                    cliente del CRM: {booking.client.name}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          <form action={deleteBookingAction}>
            <input type="hidden" name="id" value={booking.id} />
            <Button type="submit" variant="destructive" className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar booking
            </Button>
          </form>
        </div>
      </div>

      <Card className="bg-white p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">Contrato</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              {booking.contract ? (
                <>
                  <Badge variant="outline" className={contractBadgeClass(booking.contract.status)}>
                    {CONTRACT_STATUS_LABELS[booking.contract.status] ?? booking.contract.status}
                  </Badge>
                  <span>· emitido <span className="font-mono">{booking.contract.createdAt.toISOString().slice(0, 10)}</span></span>
                </>
              ) : (
                "No emitido"
              )}
            </div>
          </div>
        </div>
        {booking.contract ? (
          <Link href={`/admin/ventas/${booking.id}/contrato`} className="no-underline">
            <Button className="font-bold">Ver / firmar contrato</Button>
          </Link>
        ) : (
          <form action={issueContractAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <Button type="submit" className="font-bold">Emitir contrato</Button>
          </form>
        )}
      </Card>

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
