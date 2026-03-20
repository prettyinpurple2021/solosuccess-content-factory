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

  let userId: string
  try {
    userId = JSON.parse(Buffer.from(state, "base64url").toString()).userId
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_state`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_user`)
  }

  const appId = process.env.FACEBOOK_APP_ID!
  const appSecret = process.env.FACEBOOK_APP_SECRET!
  const redirectUri = `${appUrl}/api/auth/facebook/callback`

  // Exchange code for short-lived token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
  )
  if (!tokenRes.ok) return NextResponse.redirect(`${appUrl}/dashboard?oauth_error=facebook_token`)
  const { access_token: shortToken } = await tokenRes.json()

  // Exchange for long-lived token (~60 days)
  const longRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
  )
  const { access_token } = await longRes.json()

  // Get user info
  const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${access_token}`)
  const me = await meRes.json()

  await savePlatformToken(userId, "facebook", {
    access_token,
    expires_at: Date.now() + 60 * 24 * 60 * 60 * 1000, // ~60 days
    username: me.name ?? me.id,
    platform_user_id: me.id,
  })

  return NextResponse.redirect(`${appUrl}/dashboard?oauth_success=facebook&username=${encodeURIComponent(me.name ?? "")}`)
}
