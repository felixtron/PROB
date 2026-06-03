import { redirect } from "next/navigation"
import { Shield, Users as UsersIcon, UserCog } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { getSessionUser } from "@/lib/auth"
import { InviteUserForm, DeleteUserButton } from "@/components/admin/InviteUserForm"
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

function roleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin"
    case "TENANT_ADMIN":
      return "Admin"
    case "STAFF":
      return "Staff"
    case "MEMBER":
      return "Member"
    default:
      return role
  }
}

function roleBadgeClass(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "text-purple-600 border-purple-600/40 bg-purple-600/5"
    case "TENANT_ADMIN":
      return "text-primary border-primary/40 bg-primary/5"
    case "STAFF":
      return "text-blue-600 border-blue-600/40 bg-blue-600/5"
    default:
      return "text-muted-foreground"
  }
}

export default async function UsersPage() {
  const tenant = await resolveCurrentTenant()
  const session = await getSessionUser()
  if (!session) redirect("/login")

  const users = await db.user.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  })

  const tenantAdminCount = users.filter((u) => u.role === "TENANT_ADMIN").length

  const kpis = [
    { label: "Total", value: users.length, icon: UsersIcon, accent: "text-primary" },
    { label: "Admins", value: tenantAdminCount, icon: Shield, accent: "text-primary" },
    { label: "Staff", value: users.filter((u) => u.role === "STAFF").length, icon: UserCog, accent: "text-blue-600" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Administradores</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Equipo con acceso a este tenant. Solo los admins ven esta página.
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
        <InviteUserForm />
      </div>

      <Card className="bg-white overflow-x-auto py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === session.id
              const isLastAdmin = u.role === "TENANT_ADMIN" && tenantAdminCount <= 1
              let disabledReason: string | undefined
              if (isSelf) disabledReason = "tú mismo"
              else if (isLastAdmin) disabledReason = "último admin"

              return (
                <TableRow key={u.id}>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm">{u.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleBadgeClass(u.role)}>
                      {roleLabel(u.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-mono">
                    {u.createdAt.toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteUserButton
                      id={u.id}
                      disabled={Boolean(disabledReason)}
                      disabledReason={disabledReason}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
