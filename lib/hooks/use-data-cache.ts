"use client"

import { useState, useEffect, useCallback, useRef } from "react"

/**
 * Lightweight client-side data caching hook with TTL and revalidation support.
 * Provides stale-while-revalidate pattern for smoother UX during navigation.
 *
 * Features:
 * - Session-based cache (cleared on page reload)
 * - Configurable TTL (time-to-live)
 * - Background revalidation
 * - Optimistic updates via mutate()
 * - Deduplication of concurrent requests
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  isRevalidating: boolean
}

// Global in-memory cache (persists across component unmounts within session)
const globalCache = new Map<string, CacheEntry<unknown>>()

// Track in-flight requests to dedupe
const inFlightRequests = new Map<string, Promise<unknown>>()

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000

export interface UseDataCacheOptions<T> {
  /** Time-to-live in milliseconds. Default: 5 minutes */
  ttl?: number
  /** Initial data to use before fetch completes */
  initialData?: T
  /** Whether to revalidate on mount even if cache is fresh */
  revalidateOnMount?: boolean
  /** Whether to revalidate when window regains focus */
  revalidateOnFocus?: boolean
  /** Callback when data is successfully fetched */
  onSuccess?: (data: T) => void
  /** Callback when fetch fails */
  onError?: (error: Error) => void
}

export interface UseDataCacheReturn<T> {
  /** The cached data or undefined if not yet loaded */
  data: T | undefined
  /** Whether the initial fetch is in progress */
  isLoading: boolean
  /** Whether a background revalidation is in progress */
  isValidating: boolean
  /** Any error that occurred during fetch */
  error: Error | null
  /** Manually trigger a revalidation */
  revalidate: () => Promise<void>
  /** Optimistically update the cache and optionally revalidate */
  mutate: (data: T | ((prev: T | undefined) => T), shouldRevalidate?: boolean) => void
}

export function useDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseDataCacheOptions<T> = {}
): UseDataCacheReturn<T> {
  const {
    ttl = DEFAULT_TTL,
    initialData,
    revalidateOnMount = false,
    revalidateOnFocus = true,
    onSuccess,
    onError,
  } = options

  const [data, setData] = useState<T | undefined>(() => {
    // Check cache first
    const cached = globalCache.get(key) as CacheEntry<T> | undefined
    if (cached) return cached.data
    return initialData
  })
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cached = globalCache.get(key)
    return !cached && initialData === undefined
  })
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Keep refs for callbacks to avoid stale closures
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  const fetchData = useCallback(
    async (isBackground = false) => {
      // Check if request is already in flight (deduplication)
      const existing = inFlightRequests.get(key)
      if (existing) {
        return existing as Promise<T>
      }

      if (!isBackground) {
        setIsLoading(true)
      }
      setIsValidating(true)
      setError(null)

      const request = fetcher()
        .then((result) => {
          const entry: CacheEntry<T> = {
            data: result,
            timestamp: Date.now(),
            isRevalidating: false,
          }
          globalCache.set(key, entry)
          setData(result)
          setIsLoading(false)
          setIsValidating(false)
          onSuccessRef.current?.(result)
          return result
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error(String(err))
          setError(error)
          setIsLoading(false)
          setIsValidating(false)
          onErrorRef.current?.(error)
          throw error
        })
        .finally(() => {
          inFlightRequests.delete(key)
        })

      inFlightRequests.set(key, request)
      return request
    },
    [key, fetcher]
  )

  const revalidate = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  const mutate = useCallback(
    (newData: T | ((prev: T | undefined) => T), shouldRevalidate = false) => {
      const resolved = typeof newData === "function" 
        ? (newData as (prev: T | undefined) => T)(data) 
        : newData

      const entry: CacheEntry<T> = {
        data: resolved,
        timestamp: Date.now(),
        isRevalidating: false,
      }
      globalCache.set(key, entry)
      setData(resolved)

      if (shouldRevalidate) {
        revalidate()
      }
    },
    [key, data, revalidate]
  )

  // Initial fetch or revalidation
  useEffect(() => {
    const cached = globalCache.get(key) as CacheEntry<T> | undefined
    const now = Date.now()

    if (cached) {
      // Use cached data immediately
      setData(cached.data)
      setIsLoading(false)

      // Check if cache is stale
      const isStale = now - cached.timestamp > ttl

      if (isStale || revalidateOnMount) {
        // Revalidate in background
        fetchData(true)
      }
    } else {
      // No cache, fetch fresh data
      fetchData(false)
    }
  }, [key, ttl, revalidateOnMount, fetchData])

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      const cached = globalCache.get(key) as CacheEntry<T> | undefined
      if (cached) {
        const isStale = Date.now() - cached.timestamp > ttl
        if (isStale) {
          fetchData(true)
        }
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [key, ttl, revalidateOnFocus, fetchData])

  return {
    data,
    isLoading,
    isValidating,
    error,
    revalidate,
    mutate,
  }
}

/**
 * Invalidate a specific cache key, forcing next access to refetch.
 */
export function invalidateCache(key: string): void {
  globalCache.delete(key)
}

/**
 * Invalidate all cache entries matching a prefix.
 * Useful for invalidating related data (e.g., all "ideas-*" entries).
 */
export function invalidateCachePrefix(prefix: string): void {
  for (const key of globalCache.keys()) {
    if (key.startsWith(prefix)) {
      globalCache.delete(key)
    }
  }
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  globalCache.clear()
}

/**
 * Pre-populate cache with data (useful for SSR/ISR scenarios).
 */
export function preloadCache<T>(key: string, data: T): void {
  globalCache.set(key, {
    data,
    timestamp: Date.now(),
    isRevalidating: false,
  })
}
