import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import path from "path"

function resolveDbUrl(): string {
  const env = process.env.DATABASE_URL?.trim()
  if (env) {
    if (env.startsWith("file:") || env.startsWith("libsql:") || env.startsWith("http")) return env
    return `file:${env}`
  }
  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaLibSql({ url: resolveDbUrl() }),
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
