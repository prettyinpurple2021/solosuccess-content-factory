/**
 * POST /api/publish
 * Publishes content to one or more connected platforms using stored tokens.
 * Body: { platforms: PlatformKey[], body: string, contentType: string }
 * Returns: { results: { platform, success, postId?, error? }[] }
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPlatformToken, savePlatformToken } from "@/lib/platform-tokens"
import type { PlatformKey } from "@/lib/storage"

// ─── Twitter ─────────────────────────────────────────────────────────────────
async function publishTwitter(token: Awaited<ReturnType<typeof getPlatformToken>>, body: string) {
  if (!token) throw new Error("Twitter not connected")

  // Refresh token if needed
  let accessToken = token.access_token
  if (token.expires_at && Date.now() > token.expires_at - 60_000 && token.refresh_token) {
    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: token.refresh_token }),
    })
    if (res.ok) {
      const refreshed = await res.json()
      accessToken = refreshed.access_token
      // Update stored token
      token.access_token = accessToken
      token.refresh_token = refreshed.refresh_token ?? token.refresh_token
      token.expires_at = Date.now() + (refreshed.expires_in ?? 7200) * 1000
    }
  }

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: body.slice(0, 280) }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail ?? err?.title ?? "Twitter publish failed")
  }
  const data = await res.json()
  return data?.data?.id as string
}

// ─── Facebook ────────────────────────────────────────────────────────────────
async function publishFacebook(token: Awaited<ReturnType<typeof getPlatformToken>>, body: string) {
  if (!token) throw new Error("Facebook not connected")

  // Get user's pages first
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${token.access_token}`
  )
  if (!pagesRes.ok) throw new Error("Could not fetch Facebook pages")
  const pages = await pagesRes.json()
  const page = pages?.data?.[0]
  if (!page) throw new Error("No Facebook Page found — connect a Page, not a personal profile")

  const res = await fetch(`https://graph.facebook.com/v19.0/${page.id}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: body, access_token: page.access_token }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? "Facebook publish failed")
  }
  const data = await res.json()
  return data.id as string
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────
async function publishLinkedIn(token: Awaited<ReturnType<typeof getPlatformToken>>, body: string) {
  if (!token) throw new Error("LinkedIn not connected")

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${token.platform_user_id}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: body },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message ?? "LinkedIn publish failed")
  }
  const location = res.headers.get("x-restli-id") ?? (await res.json().catch(() => ({}))).id
  return location as string
}

// ─── BlueSky ──────────────────────────────────────────────────────────────────
async function publishBlueSky(token: Awaited<ReturnType<typeof getPlatformToken>>, body: string) {
  if (!token) throw new Error("BlueSky not connected")

  // Refresh session if expired
  let accessJwt = token.access_token
  if (token.expires_at && Date.now() > token.expires_at - 60_000 && token.refresh_token) {
    const res = await fetch("https://bsky.social/xrpc/com.atproto.server.refreshSession", {
      method: "POST",
      headers: { Authorization: `Bearer ${token.refresh_token}` },
    })
    if (res.ok) {
      const refreshed = await res.json()
      accessJwt = refreshed.accessJwt
      token.access_token = accessJwt
      token.refresh_token = refreshed.refreshJwt
      token.expires_at = Date.now() + 2 * 60 * 60 * 1000
    }
  }

  const res = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo: token.platform_user_id,
      collection: "app.bsky.feed.post",
      record: {
        $type: "app.bsky.feed.post",
        text: body.slice(0, 300),
        createdAt: new Date().toISOString(),
      },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message ?? "BlueSky publish failed")
  }
  const data = await res.json()
  return data.uri as string
}

// ─── Reddit ───────────────────────────────────────────────────────────────────
async function publishReddit(
  token: Awaited<ReturnType<typeof getPlatformToken>>,
  body: string,
  subreddit?: string
) {
  if (!token) throw new Error("Reddit not connected")

  // Refresh if needed
  let accessToken = token.access_token
  if (token.expires_at && Date.now() > token.expires_at - 60_000 && token.refresh_token) {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString("base64")}`,
        "User-Agent": "SoloSuccess/1.0",
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: token.refresh_token }),
    })
    if (res.ok) {
      const refreshed = await res.json()
      accessToken = refreshed.access_token
      token.access_token = accessToken
      token.expires_at = Date.now() + (refreshed.expires_in ?? 3600) * 1000
    }
  }

  const target = subreddit ?? `u_${token.username}` // post to user profile if no subreddit given
  const res = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "SoloSuccess/1.0",
    },
    body: new URLSearchParams({
      kind: "self",
      sr: target,
      title: body.slice(0, 300),
      text: body,
      nsfw: "false",
      spoiler: "false",
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message ?? "Reddit publish failed")
  }
  const data = await res.json()
  return data?.jquery?.find((x: unknown[]) => Array.isArray(x) && x[3] === "call" )?.[2]?.[0] as string
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { platforms, body, contentType = "post", subreddit } = await req.json()
  if (!platforms?.length || !body) {
    return NextResponse.json({ error: "platforms and body are required" }, { status: 400 })
  }

  const results: { platform: string; success: boolean; postId?: string; error?: string }[] = []

  await Promise.allSettled(
    (platforms as PlatformKey[]).map(async (platform) => {
      try {
        const token = await getPlatformToken(user.id, platform)
        let postId: string | undefined

        switch (platform) {
          case "twitter":  postId = await publishTwitter(token, body); break
          case "facebook": postId = await publishFacebook(token, body); break
          case "linkedin": postId = await publishLinkedIn(token, body); break
          case "bluesky":  postId = await publishBlueSky(token, body); break
          case "reddit":   postId = await publishReddit(token, body, subreddit); break
          default:
            throw new Error(`Publishing to ${platform} is not yet supported`)
        }

        // Record in scheduled_posts
        await supabase.from("scheduled_posts").insert({
          user_id: user.id,
          platform,
          content_type: contentType,
          body,
          status: "published",
          platform_post_id: postId ?? null,
          scheduled_at: new Date().toISOString(),
        })

        // Update token if refreshed (for platforms that refresh in-place)
        if (token && (platform === "twitter" || platform === "bluesky" || platform === "reddit")) {
          await savePlatformToken(user.id, platform, token)
        }

        results.push({ platform, success: true, postId })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        await supabase.from("scheduled_posts").insert({
          user_id: user.id,
          platform,
          content_type: contentType,
          body,
          status: "failed",
          error_message: message,
        })
        results.push({ platform, success: false, error: message })
      }
    })
  )

  return NextResponse.json({ results })
}
