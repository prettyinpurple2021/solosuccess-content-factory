/**
 * BlueSky connect — POST /api/auth/bluesky/connect
 * BlueSky uses the AT Protocol with app passwords (no OAuth needed).
 * We verify the credentials immediately then store the encrypted token.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { savePlatformToken } from "@/lib/platform-tokens"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { handle, appPassword } = await req.json()
  if (!handle || !appPassword) {
    return NextResponse.json({ error: "Handle and app password are required" }, { status: 400 })
  }

  // Authenticate with BlueSky AT Protocol
  const loginRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: handle, password: appPassword }),
  })

  if (!loginRes.ok) {
    const err = await loginRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: err.message ?? "Invalid handle or app password" },
      { status: 401 }
    )
  }

  const session = await loginRes.json()

  await savePlatformToken(user.id, "bluesky", {
    access_token: session.accessJwt,
    refresh_token: session.refreshJwt,
    username: session.handle,
    platform_user_id: session.did,
    expires_at: Date.now() + 2 * 60 * 60 * 1000, // access JWTs expire ~2h; we refresh on publish
  })

  return NextResponse.json({ success: true, username: session.handle })
}
