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

  // ─── Parse State ────────────────────────────────────────────────────────────
  let userId: string
  let codeVerifier: string
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString())
    userId = parsed.userId
    codeVerifier = parsed.codeVerifier
    if (!userId || !codeVerifier) {
      throw new Error("Invalid state payload")
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_state`)
  }

  // ─── Verify Auth User ───────────────────────────────────────────────────────
  let supabase
  try {
    supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_user`)
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_auth`)
  }

  const redirectUri = `${appUrl}/api/auth/twitter/callback`
  const clientId = process.env.TWITTER_CLIENT_ID
  const clientSecret = process.env.TWITTER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_config`)
  }

  // ─── Exchange Code for Tokens ───────────────────────────────────────────────
  let tokens: {
    access_token: string
    refresh_token?: string
    expires_in?: number
    scope?: string
  }

  try {
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
      const errorBody = await tokenRes.text().catch(() => "")
      console.error("[Twitter OAuth] Token exchange failed:", tokenRes.status, errorBody)
      return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_token`)
    }

    tokens = await tokenRes.json()
  } catch (err) {
    console.error("[Twitter OAuth] Token exchange error:", err)
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_token`)
  }

  // ─── Fetch Username ─────────────────────────────────────────────────────────
  let username = ""
  let platformUserId = ""

  try {
    const meRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (meRes.ok) {
      const me = await meRes.json()
      username = me?.data?.username ?? ""
      platformUserId = me?.data?.id ?? ""
    }
  } catch (err) {
    // Non-critical - continue with empty username
    console.error("[Twitter OAuth] Failed to fetch username:", err)
  }

  // ─── Save Token ─────────────────────────────────────────────────────────────
  try {
    await savePlatformToken(userId, "twitter", {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in ?? 7200) * 1000,
      username,
      platform_user_id: platformUserId,
      scope: tokens.scope,
    })
  } catch (err) {
    console.error("[Twitter OAuth] Failed to save token:", err)
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=twitter_save`)
  }

  return NextResponse.redirect(
    `${appUrl}/dashboard?oauth_success=twitter&username=${encodeURIComponent(username)}`
  )
}
