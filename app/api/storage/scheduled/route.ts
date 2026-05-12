import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { scheduledItemFromRow, type ScheduledItemRow, type Draft, type PlatformKey } from "@/lib/storage"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") // Optional: filter by date (YYYY-MM-DD)

  let query = supabase
    .from("scheduled_items")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_for", { ascending: true })

  if (date) {
    // Filter by date - get items scheduled for that day
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`
    query = query.gte("scheduled_for", startOfDay).lte("scheduled_for", endOfDay)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = (data as ScheduledItemRow[]).map(scheduledItemFromRow)
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { draftId, type, title, scheduledFor, platforms } = body as {
    draftId?: string
    type: Draft["type"]
    title: string
    scheduledFor: string
    platforms: PlatformKey[]
  }

  const { data, error } = await supabase
    .from("scheduled_items")
    .insert({
      user_id: user.id,
      draft_id: draftId ?? null,
      type,
      title,
      scheduled_for: scheduledFor,
      platforms,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(scheduledItemFromRow(data as ScheduledItemRow))
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
    return NextResponse.json({ error: "Missing scheduled item id" }, { status: 400 })
  }

  const { error } = await supabase
    .from("scheduled_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
