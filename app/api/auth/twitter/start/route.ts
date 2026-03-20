/**
 * Twitter/X OAuth 2.0 PKCE start
 * GET /api/auth/twitter/start
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clientId = process.env.TWITTER_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: "Twitter not configured" }, { status: 503 })

  // PKCE
  const codeVerifier = randomBytes(32).toString("base64url")
  const codeChallenge = Buffer.from(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier))
  ).toString("base64url")

  const state = Buffer.from(JSON.stringify({ userId: user.id, codeVerifier })).toString("base64url")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  const redirectUri = `${appUrl}/api/auth/twitter/callback`

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "tweet.read tweet.write users.read offline.access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  return NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params}`)
}
