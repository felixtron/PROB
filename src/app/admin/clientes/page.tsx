import { Users, ShoppingBag, Calendar } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ClientForm } from "@/components/admin/ClientForm"
import { Card } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function ClientesPage() {
  const tenant = await resolveCurrentTenant()
  const clients = await db.clientProfile.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookingRequests: true, events: true } },
    },
  })

  const totalBookings = clients.reduce((acc, c) => acc + c._count.bookingRequests, 0)
  const totalEvents = clients.reduce((acc, c) => acc + c._count.events, 0)

  const kpis = [
    { label: "Clientes", value: clients.length, icon: Users, accent: "text-primary" },
    { label: "Cotizaciones", value: totalBookings, icon: ShoppingBag, accent: "text-blue-600" },
    { label: "Eventos", value: totalEvents, icon: Calendar, accent: "text-green-600" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Clientes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          CRM básico de clientes. Las cotizaciones y eventos se vinculan aquí desde Centro de Ventas.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">
          Nuevo cliente
        </h2>
        <ClientForm
          mode="create"
          initialValues={{
            name: "",
            email: "",
            phone: "",
            whatsapp: "",
            company: "",
            rfc: "",
            notes: "",
            city: "",
            state: "",
          }}
        />
      </div>

      {clients.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">Sin clientes en CRM. Agrega el primero arriba.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Listado · {clients.length}
          </h2>
          {clients.map((c) => (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap px-1 text-xs text-muted-foreground uppercase tracking-tight">
                <span className="font-black text-foreground text-sm">{c.name}</span>
                {c.company ? <span>· {c.company}</span> : null}
                <span>· {c._count.bookingRequests} cotizaciones</span>
                <span>· {c._count.events} eventos</span>
              </div>
              <ClientForm
                mode="edit"
                initialValues={{
                  id: c.id,
                  name: c.name,
                  email: c.email ?? "",
                  phone: c.phone ?? "",
                  whatsapp: c.whatsapp ?? "",
                  company: c.company ?? "",
                  rfc: c.rfc ?? "",
                  notes: c.notes ?? "",
                  city: c.city ?? "",
                  state: c.state ?? "",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
