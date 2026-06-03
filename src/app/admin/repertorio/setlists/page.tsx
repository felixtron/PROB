import Link from "next/link"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { SetlistForm } from "@/components/admin/SetlistForm"

export const dynamic = "force-dynamic"

export default async function SetlistsPage() {
  const tenant = await resolveCurrentTenant()
  const setlists = await db.setlist.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { songs: true } } },
  })

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
            Producción
          </p>
          <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Setlists</h1>
          <p className="muted" style={{ margin: 0 }}>
            Listas ordenadas de canciones armadas para shows, cocktails, ensayos o sesiones de grabación.
          </p>
        </div>
        <Link href="/admin/repertorio" className="button secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
          ← Volver al repertorio
        </Link>
      </div>

      <SetlistForm
        mode="create"
        initialValues={{ name: "", description: "", active: true }}
      />

      {setlists.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Aún no hay setlists. Crea la primera arriba.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {setlists.map((s) => (
            <Link
              key={s.id}
              href={`/admin/repertorio/setlists/${s.id}`}
              className="card"
              style={{
                padding: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                textDecoration: "none",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>
                  {s.name}
                  {!s.active ? <span className="badge muted" style={{ marginLeft: 10 }}>inactiva</span> : null}
                </div>
                {s.description ? (
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>{s.description}</p>
                ) : null}
              </div>
              <div className="muted" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                {s._count.songs} {s._count.songs === 1 ? "canción" : "canciones"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
