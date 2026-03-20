/**
 * LinkedIn OAuth 2.0 callback
 * GET /api/auth/linkedin/callback
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
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_denied`)
  }

  let userId: string
  try {
    userId = JSON.parse(Buffer.from(state, "base64url").toString()).userId
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_state`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_user`)
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/auth/linkedin/callback`

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!tokenRes.ok) return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_token`)
  const tokens = await tokenRes.json()

  // Get profile (OpenID Connect)
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const profile = await profileRes.json()
  const username = profile.name ?? profile.sub ?? ""

  await savePlatformToken(userId, "linkedin", {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + (tokens.expires_in ?? 5183944) * 1000,
    username,
    platform_user_id: profile.sub,
    scope: tokens.scope,
  })

  return NextResponse.redirect(`${appUrl}/dashboard?oauth_success=linkedin&username=${encodeURIComponent(username)}`)
}
