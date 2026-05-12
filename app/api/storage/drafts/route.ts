import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { draftFromRow, type DraftRow, type Draft, type PlatformKey } from "@/lib/storage"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const drafts = (data as DraftRow[]).map(draftFromRow)
  return NextResponse.json(drafts)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { id, type, title, body: content, platforms, scheduledFor } = body as {
    id?: string
    type: Draft["type"]
    title?: string
    body: string
    platforms: PlatformKey[]
    scheduledFor?: string
  }

  if (id) {
    // Update existing draft
    const { data, error } = await supabase
      .from("drafts")
      .update({
        type,
        title: title ?? null,
        body: content,
        platforms,
        scheduled_for: scheduledFor ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(draftFromRow(data as DraftRow))
  } else {
    // Create new draft
    const { data, error } = await supabase
      .from("drafts")
      .insert({
        user_id: user.id,
        type,
        title: title ?? null,
        body: content,
        platforms,
        scheduled_for: scheduledFor ?? null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(draftFromRow(data as DraftRow))
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing draft id" }, { status: 400 })
  }

  const { error } = await supabase
    .from("drafts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
