import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { MusicianForm } from "@/components/admin/MusicianForm"

export const dynamic = "force-dynamic"

function parseInstruments(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

export default async function MusiciansPage() {
  const tenant = await resolveCurrentTenant()
  const musicians = await db.musician.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  })

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Músicos</h1>
        <p className="muted" style={{ margin: 0 }}>
          Roster interno del proyecto. Solo visible para admins; no se publica afuera.
        </p>
      </div>

      <MusicianForm
        mode="create"
        initialValues={{
          name: "",
          role: "",
          instruments: "",
          bio: "",
          email: "",
          whatsapp: "",
          photoUrl: "",
          active: true,
        }}
      />

      {musicians.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Aún no hay músicos en el roster. Agrega el primero arriba.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {musicians.map((m) => (
            <MusicianForm
              key={m.id}
              mode="edit"
              initialValues={{
                id: m.id,
                name: m.name,
                role: m.role ?? "",
                instruments: parseInstruments(m.instruments).join("\n"),
                bio: m.bio ?? "",
                email: m.email ?? "",
                whatsapp: m.whatsapp ?? "",
                photoUrl: m.photoUrl ?? "",
                active: m.active,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
