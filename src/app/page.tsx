import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { isInstalled } from "@/lib/install"

export default async function HomePage() {
  if (!(await isInstalled())) redirect("/install")

  const organization = await db.organization.findUnique({ where: { id: "singleton" } })
  const packages = await db.servicePackage.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } })

  return (
    <main>
      <section
        style={{
          minHeight: "78vh",
          display: "grid",
          placeItems: "center",
          background: organization?.heroImageUrl
            ? `linear-gradient(rgba(0,0,0,.62), rgba(0,0,0,.72)), url(${organization.heroImageUrl}) center/cover`
            : "linear-gradient(135deg, #09090b, #111827)",
        }}
      >
        <div className="page-shell">
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800 }}>
            {organization?.projectType}
          </p>
          <h1 style={{ fontSize: 64, lineHeight: 1, margin: "10px 0" }}>{organization?.name}</h1>
          <p style={{ maxWidth: 680, fontSize: 20, color: "#d1d5db" }}>{organization?.shortDescription}</p>
          <a className="button" href="/admin" style={{ display: "inline-block", textDecoration: "none", marginTop: 24 }}>
            Entrar al admin
          </a>
        </div>
      </section>

      <section className="page-shell" style={{ padding: "56px 0" }}>
        <h2>Paquetes iniciales</h2>
        <div className="grid-3">
          {packages.map((pack) => (
            <article className="card" key={pack.id} style={{ padding: 20 }}>
              <h3>{pack.name}</h3>
              <p className="muted">{pack.description}</p>
              <strong>
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: organization?.currency || "MXN",
                }).format(pack.basePrice)}
              </strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
