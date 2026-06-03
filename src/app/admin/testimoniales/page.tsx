import { Star, MessageSquareQuote, CheckCircle2, FileText } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ReviewForm } from "@/components/admin/ReviewForm"
import { togglePublishedAction } from "@/app/admin/testimoniales/actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

function isoDateInput(d: Date | null): string {
  if (!d) return ""
  return d.toISOString().slice(0, 10)
}

export default async function TestimonialesPage() {
  const tenant = await resolveCurrentTenant()
  const reviews = await db.review.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ published: "desc" }, { createdAt: "desc" }],
  })

  const publishedCount = reviews.filter((r) => r.published).length
  const draftCount = reviews.length - publishedCount
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
      : 0

  const kpis = [
    { label: "Total", value: reviews.length, icon: MessageSquareQuote, accent: "text-primary" },
    { label: "Publicados", value: publishedCount, icon: CheckCircle2, accent: "text-green-600" },
    { label: "Borradores", value: draftCount, icon: FileText, accent: "text-muted-foreground" },
    { label: "Promedio", value: avgRating > 0 ? `${avgRating} ★` : "—", icon: Star, accent: "text-yellow-500" },
  ]

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Testimoniales</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {publishedCount === 0
            ? "Aún no hay testimonios publicados en el landing."
            : `${publishedCount} publicados en el landing · ${draftCount} en borrador.`}
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
          Nuevo testimonio
        </h2>
        <ReviewForm
          mode="create"
          initialValues={{
            clientName: "",
            eventTitle: "",
            eventDate: "",
            rating: 5,
            quote: "",
            avatarUrl: "",
            source: "manual",
            published: false,
          }}
        />
      </div>

      {reviews.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">
            Aún no hay testimonios. Captura el primero arriba.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Testimonios · {reviews.length}
          </h2>
          {reviews.map((r) => (
            <div key={r.id} className="space-y-2">
              <div className="flex justify-between items-center flex-wrap gap-2 px-1">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  {r.clientName}
                  <span className="text-yellow-500 tracking-widest">
                    {"★".repeat(r.rating)}
                    <span className="text-muted-foreground/30">{"★".repeat(5 - r.rating)}</span>
                  </span>
                  {r.published ? (
                    <Badge variant="outline" className="text-green-600 border-green-600/40 bg-green-600/5">
                      publicado
                    </Badge>
                  ) : null}
                </div>
                <form action={togglePublishedAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <Button type="submit" variant="outline" size="sm" className="text-xs">
                    {r.published ? "Despublicar" : "Publicar"}
                  </Button>
                </form>
              </div>
              <ReviewForm
                mode="edit"
                initialValues={{
                  id: r.id,
                  clientName: r.clientName,
                  eventTitle: r.eventTitle ?? "",
                  eventDate: isoDateInput(r.eventDate),
                  rating: r.rating,
                  quote: r.quote,
                  avatarUrl: r.avatarUrl ?? "",
                  source: r.source,
                  published: r.published,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
