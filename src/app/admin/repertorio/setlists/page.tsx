import Link from "next/link"
import { ArrowLeft, ListMusic } from "lucide-react"
import { db } from "@/lib/db"
import { resolveCurrentTenant } from "@/lib/admin-helpers"
import { SetlistForm } from "@/components/admin/SetlistForm"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function SetlistsPage() {
  const tenant = await resolveCurrentTenant()
  const setlists = await db.setlist.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { songs: true } } },
  })

  return (
    <div className="p-8 bg-background min-h-full">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Setlists</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Listas ordenadas de canciones armadas para shows, cocktails, ensayos o sesiones de grabación.
          </p>
        </div>
        <Link href="/admin/repertorio" className="no-underline">
          <Button variant="outline" className="gap-2 h-10 px-4 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            Volver al repertorio
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">
          Nuevo setlist
        </h2>
        <SetlistForm
          mode="create"
          initialValues={{ name: "", description: "", active: true }}
        />
      </div>

      {setlists.length === 0 ? (
        <Card className="p-6 bg-white">
          <p className="text-muted-foreground text-sm m-0">Aún no hay setlists. Crea el primero arriba.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Setlists · {setlists.length}
          </h2>
          {setlists.map((s) => (
            <Link key={s.id} href={`/admin/repertorio/setlists/${s.id}`} className="no-underline block">
              <Card className="bg-white p-4 hover:border-primary/40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ListMusic className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold text-foreground truncate">{s.name}</div>
                      {!s.active ? <Badge variant="outline" className="bg-muted text-muted-foreground">inactiva</Badge> : null}
                    </div>
                    {s.description ? (
                      <p className="text-muted-foreground text-xs mt-0.5 truncate">{s.description}</p>
                    ) : null}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {s._count.songs} {s._count.songs === 1 ? "canción" : "canciones"}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
