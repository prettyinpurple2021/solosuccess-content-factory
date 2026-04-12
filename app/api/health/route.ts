import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/health
 * Health check endpoint for monitoring and deployment verification.
 * Returns system status and basic connectivity checks.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error"> = {
    server: "ok",
    database: "error",
  }

  // Check database connectivity
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("profiles").select("id").limit(1)
    if (!error) {
      checks.database = "ok"
    }
  } catch {
    // Database check failed
  }

  const allHealthy = Object.values(checks).every((status) => status === "ok")

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version ?? "1.0.0",
      environment: process.env.NODE_ENV ?? "development",
    },
    { status: allHealthy ? 200 : 503 }
  )
}

// Allow HEAD requests for lightweight health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
