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

  // ─── Parse State ────────────────────────────────────────────────────────────
  let userId: string
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString())
    userId = parsed.userId
    if (!userId) {
      throw new Error("Invalid state payload")
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_state`)
  }

  // ─── Verify Auth User ───────────────────────────────────────────────────────
  let supabase
  try {
    supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_user`)
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_auth`)
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = `${appUrl}/api/auth/linkedin/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_config`)
  }

  // ─── Exchange Code for Tokens ───────────────────────────────────────────────
  let tokens: {
    access_token: string
    refresh_token?: string
    expires_in?: number
    scope?: string
  }

  try {
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

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text().catch(() => "")
      console.error("[LinkedIn OAuth] Token exchange failed:", tokenRes.status, errorBody)
      return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_token`)
    }

    tokens = await tokenRes.json()
  } catch (err) {
    console.error("[LinkedIn OAuth] Token exchange error:", err)
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_token`)
  }

  // ─── Get Profile ────────────────────────────────────────────────────────────
  let username = ""
  let platformUserId = ""

  try {
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (profileRes.ok) {
      const profile = await profileRes.json()
      username = profile.name ?? profile.sub ?? ""
      platformUserId = profile.sub ?? ""
    }
  } catch (err) {
    // Non-critical - continue with empty username
    console.error("[LinkedIn OAuth] Failed to fetch profile:", err)
  }

  // ─── Save Token ─────────────────────────────────────────────────────────────
  try {
    await savePlatformToken(userId, "linkedin", {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in ?? 5183944) * 1000,
      username,
      platform_user_id: platformUserId,
      scope: tokens.scope,
    })
  } catch (err) {
    console.error("[LinkedIn OAuth] Failed to save token:", err)
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=linkedin_save`)
  }

  return NextResponse.redirect(
    `${appUrl}/dashboard?oauth_success=linkedin&username=${encodeURIComponent(username)}`
  )
}
