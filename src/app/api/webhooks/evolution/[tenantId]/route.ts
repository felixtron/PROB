import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ tenantId: string }> }

// Constant-time string compare to avoid timing oracle on the apikey.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

function normalizePhone(jid: string | undefined): string {
  if (!jid) return ""
  // Evolution gives JIDs like "521234567890@s.whatsapp.net"; we keep just the digits.
  return jid.replace(/@.*$/, "").replace(/[^0-9]/g, "")
}

type EvolutionUpsert = {
  event?: string
  data?: {
    key?: { remoteJid?: string; fromMe?: boolean; id?: string }
    pushName?: string
    message?: {
      conversation?: string
      extendedTextMessage?: { text?: string }
      ephemeralMessage?: { message?: { conversation?: string; extendedTextMessage?: { text?: string } } }
    }
  }
}

function extractMessageText(msg: EvolutionUpsert["data"] extends undefined ? never : NonNullable<EvolutionUpsert["data"]>["message"]): string {
  if (!msg) return ""
  if (msg.conversation) return msg.conversation
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text
  const eph = msg.ephemeralMessage?.message
  if (eph?.conversation) return eph.conversation
  if (eph?.extendedTextMessage?.text) return eph.extendedTextMessage.text
  return ""
}

export async function POST(req: Request, { params }: RouteContext) {
  const { tenantId } = await params

  // Bug fix vs Vendetta: verify the apikey header against the per-tenant secret.
  // Vendetta's webhook accepted any POST. We constant-time compare.
  const apikey = req.headers.get("apikey") ?? ""
  const settings = await db.integrationSettings.findUnique({ where: { tenantId } })
  if (!settings?.evolutionApiKey) {
    return new NextResponse("evolution not configured", { status: 401 })
  }
  if (!timingSafeEqual(apikey, settings.evolutionApiKey)) {
    return new NextResponse("invalid apikey", { status: 401 })
  }

  let payload: EvolutionUpsert
  try {
    payload = (await req.json()) as EvolutionUpsert
  } catch {
    return new NextResponse("invalid json", { status: 400 })
  }

  // We only persist messages.upsert events with incoming text right now.
  // Other event types (status, ack, presence) are acknowledged but skipped.
  try {
    if (payload.event === "messages.upsert") {
      const key = payload.data?.key
      if (key?.fromMe) return NextResponse.json({ skipped: "from-me" })
      const phoneNumber = normalizePhone(key?.remoteJid)
      const text = extractMessageText(payload.data?.message)
      if (!phoneNumber || !text) return NextResponse.json({ skipped: "no-content" })

      // Try to link to a known client by whatsapp / phone match.
      const knownClient = await db.clientProfile.findFirst({
        where: {
          tenantId,
          OR: [
            { whatsapp: phoneNumber },
            { phone: phoneNumber },
          ],
        },
        select: { id: true },
      })

      await db.inboxItem.create({
        data: {
          tenantId,
          phoneNumber,
          senderName: payload.data?.pushName ?? null,
          message: text,
          type: "incoming",
          status: "pending",
          priority: "medium",
          rawPayloadJson: JSON.stringify(payload),
          clientId: knownClient?.id ?? null,
        },
      })
    }
  } catch (error) {
    console.error("[evolution webhook] processing error", error)
    return new NextResponse("processing error", { status: 500 })
  }

  return NextResponse.json({ received: true })
}
