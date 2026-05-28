import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import {
  activateTenantDomainAction,
  addTenantDomainAction,
  updateTenantSettingsAction,
} from "@/app/super-admin/tenants/[tenantId]/actions"
import { requireSuperAdminConsole } from "@/lib/auth"

export const dynamic = "force-dynamic"

type TenantDetailPageProps = {
  params: Promise<{ tenantId: string }>
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  await requireSuperAdminConsole()

  const { tenantId } = await params
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: {
      domains: { orderBy: { createdAt: "asc" } },
      users: { orderBy: { createdAt: "asc" } },
      servicePackages: { orderBy: { basePrice: "asc" } },
      integrationSettings: true,
      bankSettings: true,
      provisioningJobs: {
        include: { template: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!tenant) notFound()

  return (
    <main className="page-shell" style={{ padding: "48px 0", display: "grid", gap: 28 }}>
      <div>
        <Link className="muted" href="/super-admin" style={{ textDecoration: "none" }}>
          ← Superadmin
        </Link>
        <h1 style={{ fontSize: 44, lineHeight: 1, margin: "12px 0 8px" }}>{tenant.name}</h1>
        <p className="muted" style={{ margin: 0 }}>
          {tenant.slug} · {tenant.status.toLowerCase()} · comisión {(tenant.revenueShareRate * 100).toFixed(0)}%
        </p>
      </div>

      <div className="grid-3">
        <div className="card" style={{ padding: 20 }}>
          <strong>Dominio principal</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            {tenant.primaryDomain || "Pendiente"}
          </p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <strong>Stripe Connect</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            {tenant.stripeChargesEnabled ? "Cargos habilitados" : "Pendiente"}
          </p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <strong>Integraciones</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            Evolution: {tenant.integrationSettings?.evolutionEnabled ? "activo" : "pendiente"}
          </p>
        </div>
      </div>

      <section className="card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Configuración de plataforma</h2>
        <form action={updateTenantSettingsAction} className="grid-3">
          <input name="tenantId" type="hidden" value={tenant.id} />
          <div className="field">
            <label>Estado</label>
            <select name="status" defaultValue={tenant.status}>
              <option value="ACTIVE">Activo</option>
              <option value="PAUSED">Pausado</option>
              <option value="DELETED">Eliminado</option>
            </select>
          </div>
          <div className="field">
            <label>Comisión plataforma (%)</label>
            <input
              name="revenueShareRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              defaultValue={(tenant.revenueShareRate * 100).toString()}
            />
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <button className="button" type="submit">
              Guardar
            </button>
          </div>
        </form>
      </section>

      <section className="grid-2" style={{ alignItems: "start" }}>
        <div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0 }}>Dominios</h2>
          <form action={addTenantDomainAction} className="grid-2">
            <input name="tenantId" type="hidden" value={tenant.id} />
            <div className="field">
              <label>Nuevo dominio custom</label>
              <input name="hostname" placeholder="cliente.com" />
            </div>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="button secondary" type="submit">
                Agregar dominio
              </button>
            </div>
          </form>
          {tenant.domains.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>Sin dominios configurados.</p>
          ) : (
            tenant.domains.map((domain) => (
              <div className="card" key={domain.id} style={{ padding: 14, display: "grid", gap: 10 }}>
                <strong>{domain.hostname}</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  {domain.type.toLowerCase()} · {domain.status.toLowerCase()}
                </p>
                {domain.status !== "ACTIVE" ? (
                  <>
                    <p className="muted" style={{ margin: 0, overflowWrap: "anywhere" }}>
                      TXT esperado: prob-domain-verification={domain.verificationToken}
                    </p>
                    <form action={activateTenantDomainAction}>
                      <input name="tenantId" type="hidden" value={tenant.id} />
                      <input name="domainId" type="hidden" value={domain.id} />
                      <input name="hostname" type="hidden" value={domain.hostname} />
                      <button className="button secondary" type="submit">
                        Marcar activo
                      </button>
                    </form>
                  </>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0 }}>Paquetes</h2>
          {tenant.servicePackages.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>Sin paquetes iniciales.</p>
          ) : (
            tenant.servicePackages.map((pack) => (
              <div className="card" key={pack.id} style={{ padding: 14 }}>
                <strong>{pack.name}</strong>
                <p className="muted" style={{ margin: "6px 0" }}>{pack.description}</p>
                <span>
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: tenant.currency,
                  }).format(pack.basePrice)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Administradores y equipo</h2>
        <div className="grid-3">
          {tenant.users.map((user) => (
            <div className="card" key={user.id} style={{ padding: 14 }}>
              <strong>{user.name || user.email}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>
                {user.email}
                <br />
                {user.role.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Provisioning</h2>
        <div className="grid-3">
          {tenant.provisioningJobs.map((job) => (
            <div className="card" key={job.id} style={{ padding: 14 }}>
              <strong>{job.status.toLowerCase()}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>
                {job.template?.name || "Sin plantilla"}
                <br />
                {job.summary || job.error || "Sin resumen"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
