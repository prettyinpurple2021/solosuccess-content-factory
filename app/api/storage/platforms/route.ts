import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { connectedPlatformFromRow, type ConnectedPlatformRow, type PlatformKey } from "@/lib/storage"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("connected_platforms")
    .select("*")
    .eq("user_id", user.id)
    .order("connected_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const platforms = (data as ConnectedPlatformRow[]).map(connectedPlatformFromRow)
  return NextResponse.json(platforms)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { key, username } = body as {
    key: PlatformKey
    username: string
  }

  // First, delete any existing connection for this platform
  await supabase
    .from("connected_platforms")
    .delete()
    .eq("user_id", user.id)
    .eq("platform_key", key)

  // Then insert new connection
  const { data, error } = await supabase
    .from("connected_platforms")
    .insert({
      user_id: user.id,
      platform_key: key,
      username,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(connectedPlatformFromRow(data as ConnectedPlatformRow))
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (!key) {
    return NextResponse.json({ error: "Missing platform key" }, { status: 400 })
  }

  const { error } = await supabase
    .from("connected_platforms")
    .delete()
    .eq("user_id", user.id)
    .eq("platform_key", key)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
