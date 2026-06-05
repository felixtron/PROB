import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * Health check endpoint for Docker/container orchestration
 * 
 * Returns:
 * - 200 if app is healthy
 * - 503 if database is down
 */
export async function GET() {
  try {
    // Quick DB connectivity check
    await db.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
