import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ideaFromRow, type IdeaRow } from "@/lib/storage"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", user.id)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const ideas = (data as IdeaRow[]).map(ideaFromRow)
  return NextResponse.json(ideas)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { id, title, body: content, tags, sourceUrl, pinned } = body as {
    id?: string
    title: string
    body: string
    tags: string[]
    sourceUrl?: string
    pinned: boolean
  }

  if (id) {
    // Update existing idea
    const { data, error } = await supabase
      .from("ideas")
      .update({
        title,
        body: content,
        tags,
        source_url: sourceUrl ?? null,
        pinned,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(ideaFromRow(data as IdeaRow))
  } else {
    // Create new idea
    const { data, error } = await supabase
      .from("ideas")
      .insert({
        user_id: user.id,
        title,
        body: content,
        tags,
        source_url: sourceUrl ?? null,
        pinned: pinned ?? false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(ideaFromRow(data as IdeaRow))
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
    return NextResponse.json({ error: "Missing idea id" }, { status: 400 })
  }

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { id, pinned } = body as { id: string; pinned: boolean }

  if (!id) {
    return NextResponse.json({ error: "Missing idea id" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("ideas")
    .update({ pinned, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(ideaFromRow(data as IdeaRow))
}
