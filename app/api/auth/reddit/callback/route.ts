/**
 * Reddit OAuth 2.0 callback
 * GET /api/auth/reddit/callback
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
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_denied`)
  }

  let userId: string
  try {
    userId = JSON.parse(Buffer.from(state, "base64url").toString()).userId
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_state`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_user`)
  }

  const clientId = process.env.REDDIT_CLIENT_ID!
  const clientSecret = process.env.REDDIT_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/auth/reddit/callback`

  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "User-Agent": "SoloSuccess/1.0",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!tokenRes.ok) return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_token`)
  const tokens = await tokenRes.json()

  // Get username
  const meRes = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "User-Agent": "SoloSuccess/1.0",
    },
  })
  const me = await meRes.json()
  const username = me.name ?? ""

  await savePlatformToken(userId, "reddit", {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
    username,
    platform_user_id: String(me.id ?? ""),
    scope: tokens.scope,
  })

  return NextResponse.redirect(`${appUrl}/dashboard?oauth_success=reddit&username=${encodeURIComponent(username)}`)
}
