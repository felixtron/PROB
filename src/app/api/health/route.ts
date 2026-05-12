import { NextResponse } from "next/server"
import { isInstalled } from "@/lib/install"

export async function GET() {
  return NextResponse.json({
    ok: true,
    installed: await isInstalled(),
    app: "PROB",
  })
}
