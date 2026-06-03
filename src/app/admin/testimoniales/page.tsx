import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { ReviewForm } from "@/components/admin/ReviewForm"
import { togglePublishedAction } from "@/app/admin/testimoniales/actions"

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

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="muted" style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, margin: 0 }}>
          Clientes
        </p>
        <h1 style={{ fontSize: 32, margin: "8px 0 4px" }}>Testimoniales</h1>
        <p className="muted" style={{ margin: 0 }}>
          {publishedCount === 0
            ? "Aún no hay testimonios publicados en el landing."
            : `${publishedCount} publicados · ${reviews.length - publishedCount} en borrador.`}
        </p>
      </div>

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

      {reviews.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="muted" style={{ margin: 0 }}>
            Aún no hay testimonios. Captura el primero arriba.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "0 4px" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {r.clientName}
                  <span className="muted" style={{ fontWeight: 400 }}>
                    {" · "}{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </span>
                </span>
                <form action={togglePublishedAction} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="button secondary"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                  >
                    {r.published ? "Despublicar" : "Publicar"}
                  </button>
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
