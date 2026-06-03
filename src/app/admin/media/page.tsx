import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { MediaForm } from "@/components/admin/MediaForm"
import { togglePublishedAction, moveMediaAction } from "@/app/admin/media/actions"

export const dynamic = "force-dynamic"

const KIND_LABELS: Record<string, string> = {
  gallery: "Galería",
  press: "Press",
  hero: "Hero / Banner",
  promo: "Promo",
}

const KIND_DESCRIPTIONS: Record<string, string> = {
  gallery: "Fotos del proyecto que se muestran como mosaico en el landing.",
  press: "Logos de medios que han cubierto al artista (se muestra como tira/strip).",
  hero: "Imágenes para el hero principal del landing (rotación o variante).",
  promo: "Cards destacadas para anuncios o promociones puntuales.",
}

const KIND_ORDER = ["gallery", "press", "hero", "promo"] as const

export default async function MediaPage() {
  const tenant = await resolveCurrentTenant()
  const all = await db.siteMedia.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  })

  const byKind = new Map<string, typeof all>()
  for (const m of all) {
    const existing = byKind.get(m.kind)
    if (existing) existing.push(m)
    else byKind.set(m.kind, [m])
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Marketing
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Banners y Galería</h1>
        <p className="muted" style={{ margin: 0 }}>
          Subí los archivos a Cloudinary / Drive público / S3 y pega aquí las URLs. El landing los
          renderiza según el tipo y orden que les des.
        </p>
      </div>

      <MediaForm
        mode="create"
        initialValues={{
          kind: "gallery",
          title: "",
          alt: "",
          url: "",
          thumbnailUrl: "",
          caption: "",
          linkUrl: "",
          sortOrder: 0,
          published: true,
        }}
      />

      {all.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>
            Aún no hay media. Agrega la primera arriba — empezá por la galería con 6-12 fotos.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          {KIND_ORDER.filter((k) => byKind.has(k)).map((kind) => {
            const items = byKind.get(kind) ?? []
            return (
              <div key={kind} style={{ display: "grid", gap: 12 }}>
                <div>
                  <p className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                    {KIND_LABELS[kind]} · {items.length}
                  </p>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                    {KIND_DESCRIPTIONS[kind]}
                  </p>
                </div>

                {items.map((m, idx) => (
                  <div key={m.id} style={{ display: "grid", gap: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        background: "var(--card)",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.thumbnailUrl || m.url}
                        alt={m.alt}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: kind === "press" ? "contain" : "cover",
                          borderRadius: 6,
                          background: "rgba(0,0,0,0.04)",
                          border: "1px solid var(--border)",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>
                          {m.title || m.alt}
                          {!m.published ? <span className="badge muted" style={{ marginLeft: 8 }}>oculto</span> : null}
                        </div>
                        {m.caption ? (
                          <div className="muted" style={{ fontSize: 12 }}>{m.caption}</div>
                        ) : null}
                        <div className="muted" style={{ fontSize: 11, marginTop: 2, wordBreak: "break-all" }}>
                          orden {m.sortOrder} · {m.url.slice(0, 60)}{m.url.length > 60 ? "..." : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <form action={moveMediaAction} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button
                            type="submit"
                            className="button secondary"
                            disabled={idx === 0}
                            style={{ padding: "4px 8px", fontSize: 12 }}
                            aria-label="Subir"
                          >
                            ↑
                          </button>
                        </form>
                        <form action={moveMediaAction} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button
                            type="submit"
                            className="button secondary"
                            disabled={idx === items.length - 1}
                            style={{ padding: "4px 8px", fontSize: 12 }}
                            aria-label="Bajar"
                          >
                            ↓
                          </button>
                        </form>
                        <form action={togglePublishedAction} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            type="submit"
                            className="button secondary"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                          >
                            {m.published ? "Ocultar" : "Publicar"}
                          </button>
                        </form>
                      </div>
                    </div>

                    <MediaForm
                      mode="edit"
                      initialValues={{
                        id: m.id,
                        kind: m.kind,
                        title: m.title ?? "",
                        alt: m.alt,
                        url: m.url,
                        thumbnailUrl: m.thumbnailUrl ?? "",
                        caption: m.caption ?? "",
                        linkUrl: m.linkUrl ?? "",
                        sortOrder: m.sortOrder,
                        published: m.published,
                      }}
                    />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
