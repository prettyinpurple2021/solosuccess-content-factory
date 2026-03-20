/**
 * Server-side helpers for storing and retrieving encrypted platform tokens
 * in the platform_tokens Supabase table.
 */

import { createClient } from "@/lib/supabase/server"
import { encryptToken, decryptToken } from "@/lib/token-crypto"
import type { PlatformKey } from "@/lib/storage"

export interface PlatformTokenData {
  access_token: string
  access_token_secret?: string   // Twitter OAuth 1.0a
  refresh_token?: string
  expires_at?: number            // unix ms
  username?: string
  platform_user_id?: string
  scope?: string
}

export async function savePlatformToken(
  userId: string,
  platform: PlatformKey,
  data: PlatformTokenData
): Promise<void> {
  const supabase = await createClient()
  const encrypted = encryptToken(data)
  const { error } = await supabase
    .from("platform_tokens")
    .upsert(
      { user_id: userId, platform, token_data: Array.from(encrypted) },
      { onConflict: "user_id,platform" }
    )
  if (error) throw new Error(`Failed to save token: ${error.message}`)
}

export async function getPlatformToken(
  userId: string,
  platform: PlatformKey
): Promise<PlatformTokenData | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("platform_tokens")
    .select("token_data")
    .eq("user_id", userId)
    .eq("platform", platform)
    .single()
  if (error || !data) return null
  const buf = Buffer.from(data.token_data)
  return decryptToken<PlatformTokenData>(buf)
}

export async function deletePlatformToken(
  userId: string,
  platform: PlatformKey
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from("platform_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("platform", platform)
}
