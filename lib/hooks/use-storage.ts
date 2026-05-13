"use client"

import useSWR, { mutate } from "swr"
import type { Draft, Idea, ScheduledItem, ConnectedPlatform, PlatformKey } from "@/lib/storage"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch")
  }
  return res.json()
}

// ─── Drafts ──────────────────────────────────────────────────────────────────

export function useDrafts() {
  const { data, error, isLoading } = useSWR<Draft[]>("/api/storage/drafts", fetcher)
  return {
    drafts: data ?? [],
    isLoading,
    error,
  }
}

export function useDraftsByType(type: Draft["type"]) {
  const { drafts, isLoading, error } = useDrafts()
  return {
    drafts: drafts.filter((d) => d.type === type),
    isLoading,
    error,
  }
}

export async function saveDraft(
  draft: Omit<Draft, "id" | "savedAt"> & { id?: string }
): Promise<Draft> {
  const res = await fetch("/api/storage/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to save draft")
  }
  const saved = await res.json()
  mutate("/api/storage/drafts")
  return saved
}

export async function deleteDraft(id: string): Promise<void> {
  const res = await fetch(`/api/storage/drafts?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to delete draft")
  }
  mutate("/api/storage/drafts")
}

// ─── Ideas ───────────────────────────────────────────────────────────────────

export function useIdeas() {
  const { data, error, isLoading } = useSWR<Idea[]>("/api/storage/ideas", fetcher)
  return {
    ideas: data ?? [],
    isLoading,
    error,
  }
}

export async function saveIdea(
  idea: Omit<Idea, "id" | "createdAt"> & { id?: string }
): Promise<Idea> {
  const res = await fetch("/api/storage/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(idea),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to save idea")
  }
  const saved = await res.json()
  mutate("/api/storage/ideas")
  return saved
}

export async function deleteIdea(id: string): Promise<void> {
  const res = await fetch(`/api/storage/ideas?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to delete idea")
  }
  mutate("/api/storage/ideas")
}

export async function pinIdea(id: string, pinned: boolean): Promise<Idea> {
  const res = await fetch("/api/storage/ideas", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, pinned }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to pin idea")
  }
  const updated = await res.json()
  mutate("/api/storage/ideas")
  return updated
}

// ─── Scheduled Items ─────────────────────────────────────────────────────────

export function useScheduledItems(date?: string) {
  const url = date ? `/api/storage/scheduled?date=${date}` : "/api/storage/scheduled"
  const { data, error, isLoading } = useSWR<ScheduledItem[]>(url, fetcher)
  return {
    scheduledItems: data ?? [],
    isLoading,
    error,
  }
}

export async function scheduleItem(
  item: Omit<ScheduledItem, "id">
): Promise<ScheduledItem> {
  const res = await fetch("/api/storage/scheduled", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to schedule item")
  }
  const saved = await res.json()
  // Invalidate all scheduled item caches
  mutate((key) => typeof key === "string" && key.startsWith("/api/storage/scheduled"), undefined, { revalidate: true })
  return saved
}

export async function deleteScheduledItem(id: string): Promise<void> {
  const res = await fetch(`/api/storage/scheduled?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to delete scheduled item")
  }
  mutate((key) => typeof key === "string" && key.startsWith("/api/storage/scheduled"), undefined, { revalidate: true })
}

// ─── Connected Platforms ─────────────────────────────────────────────────────

export function useConnectedPlatforms() {
  const { data, error, isLoading } = useSWR<ConnectedPlatform[]>("/api/storage/platforms", fetcher)
  return {
    platforms: data ?? [],
    isLoading,
    error,
  }
}

export async function connectPlatform(
  key: PlatformKey,
  username: string
): Promise<ConnectedPlatform> {
  const res = await fetch("/api/storage/platforms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, username }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to connect platform")
  }
  const saved = await res.json()
  mutate("/api/storage/platforms")
  return saved
}

export async function disconnectPlatform(key: PlatformKey): Promise<void> {
  const res = await fetch(`/api/storage/platforms?key=${key}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to disconnect platform")
  }
  mutate("/api/storage/platforms")
}

export function isPlatformConnected(
  platforms: ConnectedPlatform[],
  key: PlatformKey
): boolean {
  return platforms.some((p) => p.key === key)
}
