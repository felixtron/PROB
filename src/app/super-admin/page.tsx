import Link from "next/link"
import { db } from "@/lib/db"
import { CreateTenantForm } from "@/components/super-admin/CreateTenantForm"
import { getActiveTenantTemplates } from "@/lib/tenant-templates"

export const dynamic = "force-dynamic"

export default async function SuperAdminPage() {
  const [templates, tenants, recentJobs] = await Promise.all([
    getActiveTenantTemplates(),
    db.tenant.findMany({
      include: {
        domains: { orderBy: { createdAt: "asc" } },
        _count: { select: { users: true, servicePackages: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.tenantProvisioningJob.findMany({
      include: { tenant: true, template: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const activeTenants = tenants.filter((tenant) => tenant.status === "ACTIVE").length
  const connectedStripe = tenants.filter((tenant) => tenant.stripeChargesEnabled).length

  return (
    <main className="page-shell" style={{ padding: "48px 0", display: "grid", gap: 28 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          PROB Platform
        </p>
        <h1 style={{ fontSize: 44, lineHeight: 1, margin: "8px 0" }}>Superadmin</h1>
        <p className="muted" style={{ maxWidth: 760 }}>
          Consola central para replicar proyectos, revisar dominios y preparar Stripe Connect por tenant.
        </p>
      </div>

      <div className="grid-3">
        <div className="card" style={{ padding: 20 }}>
          <strong>Tenants</strong>
          <p style={{ fontSize: 36, margin: "12px 0 0" }}>{tenants.length}</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <strong>Activos</strong>
          <p style={{ fontSize: 36, margin: "12px 0 0" }}>{activeTenants}</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <strong>Stripe listo</strong>
          <p style={{ fontSize: 36, margin: "12px 0 0" }}>{connectedStripe}</p>
        </div>
      </div>

      <section className="grid-2" style={{ alignItems: "start" }}>
        <div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0 }}>Tenants</h2>
          {tenants.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Todavía no hay proyectos replicados.
            </p>
          ) : (
            tenants.map((tenant) => (
              <Link
                className="card"
                href={`/super-admin/tenants/${tenant.id}`}
                key={tenant.id}
                style={{ padding: 14, textDecoration: "none", display: "grid", gap: 8 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{tenant.name}</strong>
                  <span className="muted">{tenant.status.toLowerCase()}</span>
                </div>
                <span className="muted">{tenant.primaryDomain || `${tenant.slug} · dominio pendiente`}</span>
                <span className="muted">
                  {tenant._count.users} usuarios · {tenant._count.servicePackages} paquetes · {tenant.domains.length} dominios
                </span>
              </Link>
            ))
          )}
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <CreateTenantForm templates={templates} />
          <div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
            <h2 style={{ margin: 0 }}>Provisioning reciente</h2>
            {recentJobs.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                Sin jobs registrados.
              </p>
            ) : (
              recentJobs.map((job) => (
                <div className="card" key={job.id} style={{ padding: 14 }}>
                  <strong>{job.tenant?.name || "Tenant pendiente"}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {job.status.toLowerCase()} · {job.template?.name || "sin plantilla"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
