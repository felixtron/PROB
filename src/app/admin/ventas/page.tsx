import Link from "next/link"
import {
  ShoppingBag, CheckCircle2, XCircle, Clock, Banknote,
  Plus, Check, X,
} from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { updateBookingStatusAction, deleteBookingAction } from "@/app/admin/ventas/actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  expired: "Expirado",
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "confirmed":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "cancelled":
      return "bg-muted text-muted-foreground"
    case "expired":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    case "pending":
    default:
      return "text-yellow-600 border-yellow-600/40 bg-yellow-600/5"
  }
}

const FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmados" },
  { value: "cancelled", label: "Cancelados" },
  { value: "expired", label: "Expirados" },
]

function formatMoney(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountInCents / 100)
}

type VentasPageProps = {
  searchParams: Promise<{ status?: string; created?: string }>
}

export default async function VentasPage({ searchParams }: VentasPageProps) {
  const tenant = await resolveCurrentTenant()
  const { status: statusFilter = "all", created } = await searchParams

  const where = statusFilter === "all"
    ? { tenantId: tenant.id }
    : { tenantId: tenant.id, status: statusFilter }

  const [bookings, counts, valueAgg] = await Promise.all([
    db.bookingRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { client: true },
      take: 100,
    }),
    db.bookingRequest.groupBy({
      by: ["status"],
      where: { tenantId: tenant.id },
      _count: { _all: true },
      _sum: { baseAmount: true },
    }),
    db.bookingRequest.aggregate({
      where: { tenantId: tenant.id, status: "pending" },
      _sum: { baseAmount: true },
      _count: { _all: true },
    }),
  ])

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))
  const total = counts.reduce((acc, c) => acc + c._count._all, 0)

  const kpis = [
    { label: "Pipeline activo", value: valueAgg._count._all, icon: Clock, accent: "text-yellow-600" },
    {
      label: "Valor pipeline",
      value: formatMoney(valueAgg._sum.baseAmount ?? 0, tenant.currency),
      icon: Banknote,
      accent: "text-primary",
    },
    {
      label: "Confirmados",
      value: countByStatus["confirmed"] ?? 0,
      icon: CheckCircle2,
      accent: "text-green-600",
    },
    {
      label: "Total cotizaciones",
      value: total,
      icon: ShoppingBag,
      accent: "text-blue-600",
    },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Centro de Ventas</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Pipeline de cotizaciones y bookings. Crea manuales aquí; los del funnel público llegan automáticamente.
          </p>
        </div>
        <Link href="/admin/ventas/manual" className="no-underline">
          <Button className="gap-1.5 h-10 px-5 font-bold shadow-lg shadow-primary/30">
            <Plus className="w-4 h-4" />
            Nueva cotización
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="bg-card border-border/40 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Icon className={`w-4 h-4 ${kpi.accent}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{kpi.label}</span>
              </div>
              <div className="text-2xl font-black text-foreground">{kpi.value}</div>
            </Card>
          )
        })}
      </div>

      {created ? (
        <div className="mb-6 rounded-2xl border border-green-500/40 bg-green-500/5 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">
            Creado con código <strong className="font-mono">{created}</strong>.
          </p>
        </div>
      ) : null}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_OPTIONS.map((opt) => {
          const count = opt.value === "all" ? total : (countByStatus[opt.value] ?? 0)
          const isActive = (statusFilter ?? "all") === opt.value
          const href = opt.value === "all" ? "/admin/ventas" : `/admin/ventas?status=${opt.value}`
          return (
            <Link
              key={opt.value}
              href={href}
              className={cn(
                "no-underline inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border",
                isActive
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                  : "bg-card text-foreground border-border/40 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              {opt.label}
              <span className={cn("text-[11px]", isActive ? "text-white/80" : "text-muted-foreground")}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {bookings.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            {statusFilter === "all"
              ? "Aún no hay cotizaciones. Crea la primera con + Nueva cotización."
              : `Sin cotizaciones con status "${statusFilter}".`}
          </p>
        </Card>
      ) : (
        <Card className="bg-white overflow-x-auto py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Paquete</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <Link href={`/admin/ventas/${b.id}`} className="no-underline">
                      <code className="text-primary font-bold text-xs hover:underline">{b.shortCode}</code>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm">{b.clientName}</div>
                      {b.client?.email || b.client?.phone || b.clientEmail || b.clientPhone ? (
                        <div className="text-muted-foreground text-[11px]">
                          {b.client?.email ?? b.client?.phone ?? b.clientEmail ?? b.clientPhone}
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{b.packageName ?? "Custom"}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-mono">
                    {b.requestedDate ? b.requestedDate.toISOString().slice(0, 10) : "—"}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-sm font-bold">
                    {formatMoney(b.baseAmount, tenant.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass(b.status)}>
                      {STATUS_LABELS[b.status] ?? b.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-[11px] uppercase tracking-tight">{b.source}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1.5 items-center">
                      {b.status === "pending" ? (
                        <form action={updateBookingStatusAction} className="inline">
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value="confirmed" />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1 text-green-600 border-green-600/30 hover:bg-green-500/10"
                          >
                            <Check className="w-3 h-3" />
                            Confirmar
                          </Button>
                        </form>
                      ) : null}
                      {b.status !== "cancelled" ? (
                        <form action={updateBookingStatusAction} className="inline">
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="text-xs text-muted-foreground"
                          >
                            Cancelar
                          </Button>
                        </form>
                      ) : null}
                      <form action={deleteBookingAction} className="inline">
                        <input type="hidden" name="id" value={b.id} />
                        <Button type="submit" variant="destructive" size="icon-sm" aria-label="Eliminar">
                          <X className="w-3 h-3" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
