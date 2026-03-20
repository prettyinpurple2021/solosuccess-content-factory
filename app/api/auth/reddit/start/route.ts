/**
 * Reddit OAuth 2.0 start
 * GET /api/auth/reddit/start
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clientId = process.env.REDDIT_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: "Reddit not configured" }, { status: 503 })

  const state = Buffer.from(JSON.stringify({ userId: user.id, nonce: randomBytes(16).toString("hex") })).toString("base64url")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  const redirectUri = `${appUrl}/api/auth/reddit/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    state,
    redirect_uri: redirectUri,
    duration: "permanent",
    scope: "submit identity",
  })

  return NextResponse.redirect(`https://www.reddit.com/api/v1/authorize?${params}`)
}
