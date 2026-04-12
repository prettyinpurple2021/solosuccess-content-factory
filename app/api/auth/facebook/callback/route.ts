/**
 * Facebook OAuth 2.0 callback
 * GET /api/auth/facebook/callback
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
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_denied`)
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
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_state`)
  }

  // ─── Verify Auth User ───────────────────────────────────────────────────────
  let supabase
  try {
    supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_user`)
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_auth`)
  }

  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET
  const redirectUri = `${appUrl}/api/auth/facebook/callback`

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_config`)
  }

  // ─── Exchange Code for Short-Lived Token ────────────────────────────────────
  let shortToken: string

  try {
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
    )

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text().catch(() => "")
      console.error("[Facebook OAuth] Token exchange failed:", tokenRes.status, errorBody)
      return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_token`)
    }

    const tokenData = await tokenRes.json()
    shortToken = tokenData.access_token
  } catch (err) {
    console.error("[Facebook OAuth] Token exchange error:", err)
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_token`)
  }

  // ─── Exchange for Long-Lived Token (~60 days) ───────────────────────────────
  let accessToken: string = shortToken

  try {
    const longRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
    )

    if (longRes.ok) {
      const longData = await longRes.json()
      accessToken = longData.access_token ?? shortToken
    }
  } catch (err) {
    // Non-critical - use short token
    console.error("[Facebook OAuth] Long-lived token exchange failed:", err)
  }

  // ─── Get User Info ──────────────────────────────────────────────────────────
  let username = ""
  let platformUserId = ""

  try {
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`
    )

    if (meRes.ok) {
      const me = await meRes.json()
      username = me.name ?? me.id ?? ""
      platformUserId = me.id ?? ""
    }
  } catch (err) {
    // Non-critical - continue with empty username
    console.error("[Facebook OAuth] Failed to fetch user info:", err)
  }

  // ─── Save Token ─────────────────────────────────────────────────────────────
  try {
    await savePlatformToken(userId, "facebook", {
      access_token: accessToken,
      expires_at: Date.now() + 60 * 24 * 60 * 60 * 1000, // ~60 days
      username,
      platform_user_id: platformUserId,
    })
  } catch (err) {
    console.error("[Facebook OAuth] Failed to save token:", err)
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_save`)
  }

  return NextResponse.redirect(
    `${appUrl}/dashboard?oauth_success=facebook&username=${encodeURIComponent(username)}`
  )
}
