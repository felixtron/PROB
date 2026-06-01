import { db } from "@/lib/db"

export async function renderTemplate(
  tenantId: string,
  key: string,
  vars: Record<string, string> = {},
): Promise<string | null> {
  const template = await db.messageTemplate.findUnique({
    where: { tenantId_key: { tenantId, key } },
  })
  if (!template) return null

  return template.content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
    const value = vars[name]
    return value !== undefined ? value : match
  })
}
