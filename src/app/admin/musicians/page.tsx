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
    orderBy: [{ isTitular: "desc" }, { active: "desc" }, { name: "asc" }],
  })

  const titulares = musicians.filter((m) => m.isTitular)
  const suplentes = musicians.filter((m) => !m.isTitular)
  const orphanSuplentes = suplentes.filter((s) => !s.titularId)
  const titularesOptions = titulares.map((t) => ({ id: t.id, name: t.name }))

  function suplentesOf(titularId: string) {
    return suplentes.filter((s) => s.titularId === titularId)
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Banda y Suplentes</h1>
        <p className="muted" style={{ margin: 0 }}>
          Roster interno. Cada titular puede tener suplentes asignados — al asignar músicos a un evento podrás
          elegir entre el titular o cualquiera de sus suplentes.
        </p>
      </div>

      <MusicianForm
        mode="create"
        titulares={titularesOptions}
        initialValues={{
          name: "",
          role: "",
          instruments: "",
          bio: "",
          email: "",
          whatsapp: "",
          photoUrl: "",
          active: true,
          isTitular: true,
          titularId: "",
        }}
      />

      {titulares.length === 0 && suplentes.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>Aún no hay músicos en el roster. Agrega el primer titular arriba.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {titulares.map((m) => {
            const subs = suplentesOf(m.id)
            return (
              <div key={m.id} style={{ display: "grid", gap: 12 }}>
                <MusicianForm
                  mode="edit"
                  titulares={titularesOptions}
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
                    isTitular: true,
                    titularId: "",
                  }}
                />

                {subs.length > 0 ? (
                  <div style={{ paddingLeft: 32, display: "grid", gap: 12 }}>
                    <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                      Suplentes de {m.name}
                    </p>
                    {subs.map((s) => (
                      <MusicianForm
                        key={s.id}
                        mode="edit"
                        titulares={titularesOptions}
                        initialValues={{
                          id: s.id,
                          name: s.name,
                          role: s.role ?? "",
                          instruments: parseInstruments(s.instruments).join("\n"),
                          bio: s.bio ?? "",
                          email: s.email ?? "",
                          whatsapp: s.whatsapp ?? "",
                          photoUrl: s.photoUrl ?? "",
                          active: s.active,
                          isTitular: false,
                          titularId: s.titularId ?? "",
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}

          {orphanSuplentes.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                Suplentes sin titular asignado
              </p>
              {orphanSuplentes.map((s) => (
                <MusicianForm
                  key={s.id}
                  mode="edit"
                  titulares={titularesOptions}
                  initialValues={{
                    id: s.id,
                    name: s.name,
                    role: s.role ?? "",
                    instruments: parseInstruments(s.instruments).join("\n"),
                    bio: s.bio ?? "",
                    email: s.email ?? "",
                    whatsapp: s.whatsapp ?? "",
                    photoUrl: s.photoUrl ?? "",
                    active: s.active,
                    isTitular: false,
                    titularId: "",
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
