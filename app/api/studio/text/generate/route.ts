import { streamText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export const runtime = "nodejs"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const generateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  tone: z.enum(["professional", "casual", "friendly", "formal", "persuasive"]).default("professional"),
  length: z.enum(["short", "medium", "long"]).default("medium"),
})

const LENGTH_TOKENS: Record<string, number> = {
  short: 150,
  medium: 400,
  long: 800,
}

const TONE_DESCRIPTIONS: Record<string, string> = {
  professional: "professional, clear, and authoritative",
  casual: "casual, conversational, and relatable",
  friendly: "warm, friendly, and approachable",
  formal: "formal, structured, and precise",
  persuasive: "persuasive, compelling, and action-oriented",
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { prompt, tone, length } = parsed.data

  const systemPrompt = `You are an expert content writer for solo founders and entrepreneurs.
Write in a ${TONE_DESCRIPTIONS[tone]} tone.
Create well-structured, engaging content that delivers value.
Do not include any meta-commentary or explanations - just deliver the content directly.`

  try {
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: `Create the following content:\n\n${prompt}`,
      maxOutputTokens: LENGTH_TOKENS[length],
      temperature: 0.7,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
