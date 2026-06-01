import { db } from "@/lib/db"

export type EvolutionConfig = {
  baseUrl: string
  instance: string
  apiKey: string
}

export type EvolutionResult = { ok: boolean; error?: string }

function normalizeNumber(raw: string) {
  return raw.replace(/[^\d]/g, "")
}

async function postSendText(config: EvolutionConfig, to: string, text: string): Promise<EvolutionResult> {
  const number = normalizeNumber(to)
  if (!number) return { ok: false, error: "Número inválido." }
  const url = `${config.baseUrl.replace(/\/$/, "")}/message/sendText/${encodeURIComponent(config.instance)}`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: config.apiKey },
      body: JSON.stringify({ number, text }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.warn(`[evolution] send failed ${res.status}: ${body.slice(0, 200)}`)
      return { ok: false, error: `Evolution ${res.status}` }
    }
    return { ok: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    console.warn(`[evolution] send error: ${msg}`)
    return { ok: false, error: msg }
  }
}

export async function sendWhatsApp(tenantId: string, to: string, text: string): Promise<EvolutionResult> {
  const settings = await db.integrationSettings.findUnique({ where: { tenantId } })
  if (!settings?.evolutionBaseUrl || !settings.evolutionInstance || !settings.evolutionApiKey) {
    return { ok: false, error: "Evolution no está configurado para este tenant." }
  }
  return postSendText(
    { baseUrl: settings.evolutionBaseUrl, instance: settings.evolutionInstance, apiKey: settings.evolutionApiKey },
    to,
    text,
  )
}

export async function testEvolution(config: EvolutionConfig, to: string, text: string): Promise<EvolutionResult> {
  if (!config.baseUrl || !config.instance || !config.apiKey) {
    return { ok: false, error: "Falta baseUrl, instance o apiKey." }
  }
  return postSendText(config, to, text)
}
