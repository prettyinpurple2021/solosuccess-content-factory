"use client"

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useDataCache, invalidateCache } from "./use-data-cache"

export interface ConnectedPlatformRow {
  platform_key: string
  username: string
}

export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  onboarded: boolean
}

const CACHE_KEYS = {
  platforms: (userId: string) => `platforms-${userId}`,
  profile: (userId: string) => `profile-${userId}`,
  user: "current-user",
}

/**
 * Hook for fetching and caching the current user.
 * TTL: 10 minutes (user data rarely changes)
 */
export function useCurrentUser() {
  const fetcher = useCallback(async () => {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      throw new Error(error?.message || "Not authenticated")
    }
    return user
  }, [])

  return useDataCache(CACHE_KEYS.user, fetcher, {
    ttl: 10 * 60 * 1000, // 10 minutes
    revalidateOnFocus: false, // User doesn't change often
  })
}

/**
 * Hook for fetching and caching connected platforms for a user.
 * TTL: 5 minutes (platforms can change when user connects/disconnects)
 */
export function useConnectedPlatforms(userId: string | null) {
  const fetcher = useCallback(async (): Promise<ConnectedPlatformRow[]> => {
    if (!userId) return []
    
    const supabase = createClient()
    const { data, error } = await supabase
      .from("connected_platforms")
      .select("platform_key, username")
      .eq("user_id", userId)

    if (error) {
      throw new Error(error.message)
    }

    return data ?? []
  }, [userId])

  const cacheKey = userId ? CACHE_KEYS.platforms(userId) : "platforms-none"

  const result = useDataCache(cacheKey, fetcher, {
    ttl: 5 * 60 * 1000, // 5 minutes
    initialData: [],
    revalidateOnFocus: true,
  })

  // Helper to invalidate platforms cache after mutations
  const invalidatePlatforms = useCallback(() => {
    if (userId) {
      invalidateCache(CACHE_KEYS.platforms(userId))
    }
  }, [userId])

  return {
    ...result,
    invalidatePlatforms,
  }
}

/**
 * Hook for fetching and caching user profile.
 * TTL: 5 minutes
 */
export function useUserProfile(userId: string | null) {
  const fetcher = useCallback(async (): Promise<UserProfile | null> => {
    if (!userId) return null

    const supabase = createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, onboarded")
      .eq("id", userId)
      .single()

    if (error) {
      // Profile might not exist yet
      if (error.code === "PGRST116") return null
      throw new Error(error.message)
    }

    // Get email from auth user
    const { data: { user } } = await supabase.auth.getUser()

    return {
      id: data.id,
      email: user?.email ?? "",
      display_name: data.display_name,
      onboarded: data.onboarded ?? false,
    }
  }, [userId])

  const cacheKey = userId ? CACHE_KEYS.profile(userId) : "profile-none"

  const result = useDataCache(cacheKey, fetcher, {
    ttl: 5 * 60 * 1000,
    revalidateOnFocus: false,
  })

  // Helper to invalidate profile cache after mutations
  const invalidateProfile = useCallback(() => {
    if (userId) {
      invalidateCache(CACHE_KEYS.profile(userId))
    }
  }, [userId])

  return {
    ...result,
    invalidateProfile,
  }
}

/**
 * Invalidate all user-related caches.
 * Call this on logout or when user data fundamentally changes.
 */
export function invalidateUserCaches(userId?: string) {
  invalidateCache(CACHE_KEYS.user)
  if (userId) {
    invalidateCache(CACHE_KEYS.platforms(userId))
    invalidateCache(CACHE_KEYS.profile(userId))
  }
}
