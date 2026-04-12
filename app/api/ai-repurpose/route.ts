import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { repurposeSchema, formatZodError } from "@/lib/validations/api"

export const runtime = "nodejs"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const FORMAT_PROMPTS: Record<string, string> = {
  twitter: `Rewrite the following content as a punchy Twitter/X post for a solo founder. 
Rules: Under 280 characters, strong hook, ends with relevance (no generic hashtags yet unless natural), authentic voice.`,

  thread: `Rewrite the following content as a Twitter thread for a solo founder.
Rules: 5 tweets, numbered 1/5 through 5/5, each under 270 characters, first tweet is the hook, last tweet has a CTA, break at natural points.`,

  linkedin: `Rewrite the following content as a LinkedIn post for a solo founder.
Rules: Professional but personal tone, short punchy paragraphs with line breaks, ends with an open question or CTA to comment, 150–300 words, include 3-5 relevant hashtags at the end.`,

  newsletter: `Rewrite the following content as an email newsletter opening for a solo founder.
Rules: Include a compelling subject line at the top, conversational "hey [First Name]" opener, 2-3 short paragraphs, end with a teaser for next week. Warm, direct voice.`,

  video_script: `Rewrite the following content as a short-form video script (Reels/TikTok/Shorts) for a solo founder.
Rules: 45-60 seconds when read aloud, [HOOK] in first 3 seconds (bold statement or question), [MAIN POINTS] as 3 bullet points, [CTA] at end. Label each section.`,

  blog_outline: `Rewrite the following content as a blog post outline for a solo founder.
Rules: Click-worthy H1 title, meta description under 155 chars, 4-5 H2 sections with 2-3 bullet points each, a conclusion with CTA. SEO-friendly but not robotic.`,
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

  const parsed = repurposeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
  }

  const { formatId, input } = parsed.data

  const systemPrompt = FORMAT_PROMPTS[formatId]
  if (!systemPrompt) {
    return NextResponse.json({ error: "Unknown format" }, { status: 400 })
  }

  // ─── AI Generation ──────────────────────────────────────────────────────────
  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are an expert content strategist for solo founders. ${systemPrompt}`,
      prompt: `Here is the original content to repurpose:\n\n${input}`,
      maxTokens: 600,
      temperature: 0.75,
    })

    return NextResponse.json({ text })
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
