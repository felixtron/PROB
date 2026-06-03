import { Banknote, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = "force-dynamic"

function formatMoney(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100)
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "succeeded":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "failed":
      return "text-red-600 border-red-600/40 bg-red-600/5"
    case "refunded":
      return "bg-muted text-muted-foreground"
    case "processing":
      return "text-yellow-600 border-yellow-600/40 bg-yellow-600/5"
    default:
      return "text-muted-foreground"
  }
}

const STATUS_LABELS: Record<string, string> = {
  succeeded: "Completado",
  failed: "Fallido",
  refunded: "Reembolsado",
  processing: "Procesando",
}

export default async function PaymentsPage() {
  const tenant = await resolveCurrentTenant()

  const payments = await db.payment.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ paidAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: 50,
  })

  const succeeded = payments.filter((p) => p.status === "succeeded")
  const totalSucceeded = succeeded.reduce((acc, p) => acc + p.amount, 0)
  const currency = payments[0]?.currency ?? tenant.currency

  const kpis = [
    { label: "Cobros (top 50)", value: payments.length, icon: Banknote, accent: "text-primary" },
    { label: "Completados", value: succeeded.length, icon: CheckCircle2, accent: "text-green-600" },
    {
      label: "Total recibido",
      value: formatMoney(totalSucceeded, currency),
      icon: Banknote,
      accent: "text-green-600",
    },
    {
      label: "Fallidos",
      value: payments.filter((p) => p.status === "failed").length,
      icon: AlertCircle,
      accent: "text-red-600",
    },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Pagos</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Últimos 50 cobros recibidos por webhook de Stripe.
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

      {payments.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">Aún no hay pagos registrados.</p>
        </Card>
      ) : (
        <Card className="bg-white overflow-x-auto py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>PaymentIntent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const date = (p.paidAt ?? p.createdAt).toISOString().slice(0, 10)
                const customer = p.customerName || p.customerEmail || "—"
                const shortId = p.stripePaymentIntentId.slice(0, 12) + "…"
                return (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap text-sm">{date}</TableCell>
                    <TableCell className="text-sm">{customer}</TableCell>
                    <TableCell className="text-sm">{p.description || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(p.status)}>
                        {STATUS_LABELS[p.status] || p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap text-sm font-bold">
                      {formatMoney(p.amount, p.currency)}
                    </TableCell>
                    <TableCell>
                      <code className="text-[11px] font-mono">{shortId}</code>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
