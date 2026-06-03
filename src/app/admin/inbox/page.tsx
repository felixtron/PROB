import Link from "next/link"
import { Inbox, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react"
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

function statusBadgeClass(status: string): string {
  switch (status) {
    case "responded":
      return "text-green-600 border-green-600/40 bg-green-600/5"
    case "archived":
      return "bg-muted text-muted-foreground"
    case "pending":
    default:
      return "text-yellow-600 border-yellow-600/40 bg-yellow-600/5"
  }
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  responded: "Respondido",
  archived: "Archivado",
}

function truncate(s: string, max = 120): string {
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + "…"
}

export default async function InboxPage() {
  const tenant = await resolveCurrentTenant()
  const [items, integrations] = await Promise.all([
    db.inboxItem.findMany({
      where: { tenantId: tenant.id },
      orderBy: { receivedAt: "desc" },
      take: 100,
      include: { client: { select: { name: true } } },
    }),
    db.integrationSettings.findUnique({ where: { tenantId: tenant.id } }),
  ])

  const evolutionConfigured = Boolean(
    integrations?.evolutionBaseUrl && integrations.evolutionInstance && integrations.evolutionApiKey,
  )

  const pendingCount = items.filter((i) => i.status === "pending").length
  const respondedCount = items.filter((i) => i.status === "responded").length

  const kpis = [
    { label: "Total", value: items.length, icon: Inbox, accent: "text-primary" },
    { label: "Pendientes", value: pendingCount, icon: AlertTriangle, accent: "text-yellow-600" },
    { label: "Respondidos", value: respondedCount, icon: CheckCircle2, accent: "text-green-600" },
    { label: "WhatsApp", value: evolutionConfigured ? "Activo" : "Apagado", icon: MessageSquare, accent: evolutionConfigured ? "text-green-600" : "text-muted-foreground" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Bandeja de Entrada</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Mensajes entrantes por WhatsApp (Evolution). Vinculamos al CRM cuando reconocemos el número.
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

      {!evolutionConfigured ? (
        <div className="mb-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            Evolution no está configurado.{" "}
            <Link href="/admin/integrations" className="underline font-bold">
              Configúralo en Integraciones
            </Link>{" "}
            para recibir mensajes aquí.
          </p>
        </div>
      ) : null}

      {items.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Sin mensajes entrantes aún. Cuando alguien escriba al WhatsApp configurado, aparecerá aquí.
          </p>
        </Card>
      ) : (
        <Card className="bg-white overflow-x-auto py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recibido</TableHead>
                <TableHead>De</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {i.receivedAt.toISOString().slice(0, 16).replace("T", " ")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm">{i.senderName ?? "Desconocido"}</div>
                      <div className="text-muted-foreground text-xs font-mono">{i.phoneNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[480px] text-sm">{truncate(i.message)}</TableCell>
                  <TableCell className="text-sm">{i.client?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass(i.status)}>
                      {STATUS_LABELS[i.status] || i.status}
                    </Badge>
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
