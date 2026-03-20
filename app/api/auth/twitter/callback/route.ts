/**
 * Twitter/X OAuth 2.0 PKCE callback
 * GET /api/auth/twitter/callback
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { savePlatformToken } from "@/lib/platform-tokens"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin

  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_denied`)
  }

  let userId: string
  let codeVerifier: string
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString())
    userId = parsed.userId
    codeVerifier = parsed.codeVerifier
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_state`)
  }

  // Verify auth user matches
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_user`)
  }

  const redirectUri = `${appUrl}/api/auth/twitter/callback`
  const clientId = process.env.TWITTER_CLIENT_ID!
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!

  // Exchange code for tokens
  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_token`)
  }

  const tokens = await tokenRes.json()

  // Fetch username
  const meRes = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const me = await meRes.json()
  const username = me?.data?.username ?? ""

  await savePlatformToken(userId, "twitter", {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + (tokens.expires_in ?? 7200) * 1000,
    username,
    platform_user_id: me?.data?.id,
    scope: tokens.scope,
  })

  return NextResponse.redirect(`${appUrl}/dashboard?oauth_success=twitter&username=${encodeURIComponent(username)}`)
}
