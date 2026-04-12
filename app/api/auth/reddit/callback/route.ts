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

  // ─── Parse State ────────────────────────────────────────────────────────────
  let userId: string
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString())
    userId = parsed.userId
    if (!userId) {
      throw new Error("Invalid state payload")
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_state`)
  }

  // ─── Verify Auth User ───────────────────────────────────────────────────────
  let supabase
  try {
    supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_user`)
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_auth`)
  }

  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  const redirectUri = `${appUrl}/api/auth/reddit/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_config`)
  }

  // ─── Exchange Code for Tokens ───────────────────────────────────────────────
  let tokens: {
    access_token: string
    refresh_token?: string
    expires_in?: number
    scope?: string
  }

  try {
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

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text().catch(() => "")
      console.error("[Reddit OAuth] Token exchange failed:", tokenRes.status, errorBody)
      return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_token`)
    }

    tokens = await tokenRes.json()
  } catch (err) {
    console.error("[Reddit OAuth] Token exchange error:", err)
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_token`)
  }

  // ─── Get Username ───────────────────────────────────────────────────────────
  let username = ""
  let platformUserId = ""

  try {
    const meRes = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "User-Agent": "SoloSuccess/1.0",
      },
    })

    if (meRes.ok) {
      const me = await meRes.json()
      username = me.name ?? ""
      platformUserId = String(me.id ?? "")
    }
  } catch (err) {
    // Non-critical - continue with empty username
    console.error("[Reddit OAuth] Failed to fetch username:", err)
  }

  // ─── Save Token ─────────────────────────────────────────────────────────────
  try {
    await savePlatformToken(userId, "reddit", {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      username,
      platform_user_id: platformUserId,
      scope: tokens.scope,
    })
  } catch (err) {
    console.error("[Reddit OAuth] Failed to save token:", err)
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=reddit_save`)
  }

  return NextResponse.redirect(
    `${appUrl}/dashboard?oauth_success=reddit&username=${encodeURIComponent(username)}`
  )
}
