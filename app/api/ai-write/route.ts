import { streamText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { writeSchema, formatZodError } from "@/lib/validations/api"

export const runtime = "nodejs"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const TYPE_PROMPTS: Record<string, string> = {
  post: "Write a punchy, engaging social media post for a solo founder. Use a strong hook, keep it under 280 characters, and end with a subtle CTA. No hashtags yet.",
  thread:
    "Write a 5-tweet thread for a solo founder sharing an insight or lesson. Number each tweet 1/5, 2/5, etc. Each tweet under 270 chars. Start with a bold hook.",
  newsletter:
    "Write a newsletter opening for a solo founder. Include: a compelling subject line, a personal hook in the first paragraph, and 3 key points. Conversational tone.",
  video:
    "Write a short-form video script (Reels/TikTok/Shorts) for a solo founder. Include: a 3-second hook, 3 main points, and a CTA at the end. Under 60 seconds when read aloud.",
  story:
    "Write an Instagram/Facebook story script for a solo founder. 3-5 slides, each with a brief caption. Include a poll or question slide. Keep it personal and engaging.",
  survey:
    "Write 5 audience survey questions for a solo founder looking to understand their audience better. Mix multiple-choice and open-ended questions.",
  blog: "Write a complete blog post outline for a solo founder, including: a click-worthy title, meta description (under 155 chars), H2 sections with bullet points, and a conclusion CTA.",
}

export async function POST(req: NextRequest) {
  // ─── Authentication ─────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ─── Input Validation ───────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = writeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
  }

  const { type, topic, existingContent } = parsed.data

  const systemPrompt = `You are an expert content strategist for solo founders and one-person businesses. 
You write clear, direct, authentic content that builds authority and trust. 
Avoid corporate jargon. Write like a smart, experienced founder talking to peers.`

  const userPrompt = TYPE_PROMPTS[type] ?? TYPE_PROMPTS.post

  const prompt = [
    userPrompt,
    topic ? `Topic / angle: ${topic}` : "",
    existingContent ? `Use this as inspiration or starting point:\n${existingContent}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")

  // ─── AI Generation ──────────────────────────────────────────────────────────
  try {
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt,
      maxOutputTokens: 800,
      temperature: 0.8,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
