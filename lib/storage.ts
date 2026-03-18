// lib/storage.ts — typed localStorage helpers for SoloSuccess Content Factory
// All functions are safe to call server-side (they no-op when window is undefined)

export type PlatformKey = "instagram" | "twitter" | "linkedin" | "youtube" | "tiktok" | "facebook"

export interface ConnectedPlatform {
  key: PlatformKey
  username: string
  connectedAt: string
}

export interface Draft {
  id: string
  type: "post" | "thread" | "newsletter" | "video" | "story" | "survey" | "blog"
  title?: string
  body: string
  platforms: PlatformKey[]
  savedAt: string
  scheduledFor?: string
}

export interface Idea {
  id: string
  title: string
  body: string
  tags: string[]
  sourceUrl?: string
  pinned: boolean
  createdAt: string
}

export interface ScheduledItem {
  id: string
  draftId: string
  type: Draft["type"]
  title: string
  scheduledFor: string // ISO string
  platforms: PlatformKey[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage quota exceeded — silently fail
  }
}

// ─── Connected Platforms ─────────────────────────────────────────────────────

const PLATFORMS_KEY = "sscf_platforms"

export function getConnectedPlatforms(): ConnectedPlatform[] {
  return getItem<ConnectedPlatform[]>(PLATFORMS_KEY, [])
}

export function connectPlatform(platform: ConnectedPlatform): void {
  const existing = getConnectedPlatforms().filter((p) => p.key !== platform.key)
  setItem(PLATFORMS_KEY, [...existing, platform])
}

export function disconnectPlatform(key: PlatformKey): void {
  setItem(PLATFORMS_KEY, getConnectedPlatforms().filter((p) => p.key !== key))
}

export function isPlatformConnected(key: PlatformKey): boolean {
  return getConnectedPlatforms().some((p) => p.key === key)
}

// ─── Drafts ──────────────────────────────────────────────────────────────────

const DRAFTS_KEY = "sscf_drafts"

export function getDrafts(): Draft[] {
  return getItem<Draft[]>(DRAFTS_KEY, [])
}

export function saveDraft(draft: Omit<Draft, "id" | "savedAt"> & { id?: string }): Draft {
  const all = getDrafts()
  const now = new Date().toISOString()
  const saved: Draft = { ...draft, id: draft.id ?? crypto.randomUUID(), savedAt: now }
  const idx = all.findIndex((d) => d.id === saved.id)
  if (idx >= 0) {
    all[idx] = saved
  } else {
    all.unshift(saved)
  }
  setItem(DRAFTS_KEY, all)
  return saved
}

export function deleteDraft(id: string): void {
  setItem(DRAFTS_KEY, getDrafts().filter((d) => d.id !== id))
}

export function getDraftsByType(type: Draft["type"]): Draft[] {
  return getDrafts().filter((d) => d.type === type)
}

// ─── Scheduled Items ─────────────────────────────────────────────────────────

const SCHEDULE_KEY = "sscf_schedule"

export function getScheduledItems(): ScheduledItem[] {
  return getItem<ScheduledItem[]>(SCHEDULE_KEY, [])
}

export function scheduleItem(item: Omit<ScheduledItem, "id">): ScheduledItem {
  const all = getScheduledItems()
  const saved: ScheduledItem = { ...item, id: crypto.randomUUID() }
  setItem(SCHEDULE_KEY, [...all, saved])
  return saved
}

export function deleteScheduledItem(id: string): void {
  setItem(SCHEDULE_KEY, getScheduledItems().filter((s) => s.id !== id))
}

export function getScheduledItemsForDate(dateStr: string): ScheduledItem[] {
  // dateStr format: "YYYY-MM-DD"
  return getScheduledItems().filter((s) => s.scheduledFor.startsWith(dateStr))
}

// ─── Ideas ───────────────────────────────────────────────────────────────────

const IDEAS_KEY = "sscf_ideas"

export function getIdeas(): Idea[] {
  return getItem<Idea[]>(IDEAS_KEY, [])
}

export function saveIdea(idea: Omit<Idea, "id" | "createdAt"> & { id?: string }): Idea {
  const all = getIdeas()
  const now = new Date().toISOString()
  const saved: Idea = { ...idea, id: idea.id ?? crypto.randomUUID(), createdAt: now }
  const idx = all.findIndex((i) => i.id === saved.id)
  if (idx >= 0) {
    all[idx] = saved
  } else {
    all.unshift(saved)
  }
  setItem(IDEAS_KEY, all)
  return saved
}

export function deleteIdea(id: string): void {
  setItem(IDEAS_KEY, getIdeas().filter((i) => i.id !== id))
}

export function pinIdea(id: string, pinned: boolean): void {
  const all = getIdeas().map((i) => (i.id === id ? { ...i, pinned } : i))
  setItem(IDEAS_KEY, all)
}
