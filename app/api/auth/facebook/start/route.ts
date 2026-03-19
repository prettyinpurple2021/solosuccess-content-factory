/**
 * Facebook OAuth 2.0 start (also covers Instagram via Meta Graph API)
 * GET /api/auth/facebook/start
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const appId = process.env.FACEBOOK_APP_ID
  if (!appId) return NextResponse.json({ error: "Facebook not configured" }, { status: 503 })

  const state = Buffer.from(JSON.stringify({ userId: user.id, nonce: randomBytes(16).toString("hex") })).toString("base64url")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  const redirectUri = `${appUrl}/api/auth/facebook/callback`

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,public_profile",
  })

  return NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`)
}
