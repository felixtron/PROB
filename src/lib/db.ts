import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

function buildClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is required (postgresql://user:pass@host:5432/db)")
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? buildClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
