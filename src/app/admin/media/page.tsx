import { Image as LucideImage, ArrowUp, ArrowDown, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { MediaForm } from "@/components/admin/MediaForm"
import { togglePublishedAction, moveMediaAction } from "@/app/admin/media/actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

  const publishedCount = all.filter((m) => m.published).length
  const byKind = new Map<string, typeof all>()
  for (const m of all) {
    const existing = byKind.get(m.kind)
    if (existing) existing.push(m)
    else byKind.set(m.kind, [m])
  }

  const kpis = [
    { label: "Total", value: all.length, icon: LucideImage, accent: "text-primary" },
    { label: "Publicados", value: publishedCount, icon: CheckCircle2, accent: "text-green-600" },
    { label: "Galería", value: byKind.get("gallery")?.length ?? 0, icon: LucideImage, accent: "text-blue-600" },
    { label: "Press", value: byKind.get("press")?.length ?? 0, icon: LucideImage, accent: "text-purple-600" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Banners y Galería</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Subí los archivos a Cloudinary / Drive público / S3 y pega aquí las URLs. El landing los
          renderiza según el tipo y orden que les des.
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

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">
          Nuevo asset
        </h2>
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
      </div>

      {all.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Aún no hay media. Agrega el primero arriba — empieza por la galería con 6-12 fotos.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {KIND_ORDER.filter((k) => byKind.has(k)).map((kind) => {
            const items = byKind.get(kind) ?? []
            return (
              <div key={kind} className="space-y-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                    {KIND_LABELS[kind]} · {items.length}
                  </h2>
                  <p className="text-muted-foreground text-xs mt-1">{KIND_DESCRIPTIONS[kind]}</p>
                </div>

                {items.map((m, idx) => (
                  <div key={m.id} className="space-y-2">
                    <Card className="bg-white p-3 flex items-center gap-3 flex-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.thumbnailUrl || m.url}
                        alt={m.alt}
                        className={`w-16 h-16 rounded-md border border-border ${kind === "press" ? "object-contain" : "object-cover"}`}
                        style={{ background: "rgba(0,0,0,0.04)" }}
                      />
                      <div className="flex-1 min-w-[160px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-sm">{m.title || m.alt}</span>
                          {!m.published ? (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">oculto</Badge>
                          ) : null}
                        </div>
                        {m.caption ? (
                          <div className="text-muted-foreground text-xs mt-0.5">{m.caption}</div>
                        ) : null}
                        <div className="text-muted-foreground text-[11px] mt-1 break-all">
                          orden {m.sortOrder} · {m.url.slice(0, 60)}{m.url.length > 60 ? "..." : ""}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <form action={moveMediaAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="direction" value="up" />
                          <Button type="submit" variant="outline" size="icon-sm" disabled={idx === 0} aria-label="Subir">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                        </form>
                        <form action={moveMediaAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="direction" value="down" />
                          <Button type="submit" variant="outline" size="icon-sm" disabled={idx === items.length - 1} aria-label="Bajar">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        </form>
                        <form action={togglePublishedAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <Button type="submit" variant="outline" size="sm" className="text-xs gap-1">
                            {m.published ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                Publicar
                              </>
                            )}
                          </Button>
                        </form>
                      </div>
                    </Card>

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
