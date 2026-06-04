import Link from "next/link"
import { MessageSquare, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { retryNotificationAction } from "@/app/admin/notificaciones/actions"
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

export const dynamic = "force-dynamic"

function statusBadgeClass(status: string): string {
  switch (status) {
    case "sent":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "failed":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    case "pending":
      return "text-yellow-600 border-yellow-600/40 bg-yellow-600/5"
    default:
      return "text-muted-foreground"
  }
}

const STATUS_LABELS: Record<string, string> = {
  sent: "Enviado",
  failed: "Fallido",
  pending: "Pendiente",
}

function truncate(s: string, max = 80): string {
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + "…"
}

export default async function NotificacionesPage() {
  const tenant = await resolveCurrentTenant()
  const [notifications, counts] = await Promise.all([
    db.notification.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { bookingRequest: { select: { id: true, shortCode: true } } },
    }),
    db.notification.groupBy({
      by: ["status"],
      where: { tenantId: tenant.id },
      _count: { _all: true },
    }),
  ])

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))

  const kpis = [
    { label: "Total (top 100)", value: notifications.length, icon: MessageSquare, accent: "text-primary" },
    { label: "Enviadas", value: countByStatus["sent"] ?? 0, icon: CheckCircle2, accent: "text-green-600" },
    { label: "Fallidas", value: countByStatus["failed"] ?? 0, icon: XCircle, accent: "text-red-600" },
    { label: "Pendientes", value: countByStatus["pending"] ?? 0, icon: RefreshCw, accent: "text-yellow-600" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Centro de Mensajería</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Historial de notificaciones enviadas (WhatsApp). Cada lead del funnel dispara una al WhatsApp del tenant.
          Las fallidas pueden reintentarse.
        </p>
      </div>

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

      {notifications.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Sin notificaciones aún. Cuando llegue un lead por el funnel (o se envíe una manual desde otra
            sección), aparecerá aquí.
          </p>
        </Card>
      ) : (
        <Card className="bg-white overflow-x-auto py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuando</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Destinatario</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Ref.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Reintentos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="whitespace-nowrap text-xs font-mono">
                    {(n.sentAt ?? n.createdAt).toISOString().slice(0, 16).replace("T", " ")}
                  </TableCell>
                  <TableCell>
                    <code className="text-[11px] font-mono">{n.type}</code>
                  </TableCell>
                  <TableCell>
                    <code className="text-[11px] font-mono">{n.recipient}</code>
                  </TableCell>
                  <TableCell className="max-w-[320px] text-sm">
                    <div>{truncate(n.message)}</div>
                    {n.errorDetails ? (
                      <div className="text-[11px] text-red-600 mt-1">err: {truncate(n.errorDetails, 100)}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {n.bookingRequest ? (
                      <Link href={`/admin/ventas/${n.bookingRequest.id}`} className="no-underline">
                        <code className="text-[11px] text-primary font-bold hover:underline">
                          {n.bookingRequest.shortCode}
                        </code>
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass(n.status)}>
                      {STATUS_LABELS[n.status] || n.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">{n.retries}</TableCell>
                  <TableCell className="text-right">
                    {n.status === "failed" ? (
                      <form action={retryNotificationAction} className="inline">
                        <input type="hidden" name="id" value={n.id} />
                        <Button type="submit" variant="outline" size="sm" className="gap-1.5 text-xs">
                          <RefreshCw className="w-3 h-3" />
                          Reintentar
                        </Button>
                      </form>
                    ) : null}
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
