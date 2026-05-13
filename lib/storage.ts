// lib/storage.ts — Supabase-backed storage for SoloSuccess Content Factory
// Provides both server-side functions and types for the application

export type PlatformKey = "instagram" | "twitter" | "linkedin" | "youtube" | "tiktok" | "facebook" | "bluesky" | "reddit" | "blog" | "myapp"

export interface ConnectedPlatform {
  id: string
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
  draftId?: string
  type: Draft["type"]
  title: string
  scheduledFor: string // ISO string
  platforms: PlatformKey[]
}

// ─── Database Row Types ─────────────────────────────────────────────────────

export interface DraftRow {
  id: string
  user_id: string
  type: Draft["type"]
  title: string | null
  body: string
  platforms: PlatformKey[]
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

export interface IdeaRow {
  id: string
  user_id: string
  title: string
  body: string
  tags: string[]
  source_url: string | null
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface ScheduledItemRow {
  id: string
  user_id: string
  draft_id: string | null
  type: string
  title: string
  scheduled_for: string
  platforms: PlatformKey[]
  created_at: string
}

export interface ConnectedPlatformRow {
  id: string
  user_id: string
  platform_key: PlatformKey
  username: string
  connected_at: string
}

// ─── Transform Functions ────────────────────────────────────────────────────

export function draftFromRow(row: DraftRow): Draft {
  return {
    id: row.id,
    type: row.type,
    title: row.title ?? undefined,
    body: row.body,
    platforms: row.platforms ?? [],
    savedAt: row.updated_at,
    scheduledFor: row.scheduled_for ?? undefined,
  }
}

export function ideaFromRow(row: IdeaRow): Idea {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: row.tags ?? [],
    sourceUrl: row.source_url ?? undefined,
    pinned: row.pinned,
    createdAt: row.created_at,
  }
}

export function scheduledItemFromRow(row: ScheduledItemRow): ScheduledItem {
  return {
    id: row.id,
    draftId: row.draft_id ?? undefined,
    type: row.type as Draft["type"],
    title: row.title,
    scheduledFor: row.scheduled_for,
    platforms: row.platforms ?? [],
  }
}

export function connectedPlatformFromRow(row: ConnectedPlatformRow): ConnectedPlatform {
  return {
    id: row.id,
    key: row.platform_key,
    username: row.username,
    connectedAt: row.connected_at,
  }
}
