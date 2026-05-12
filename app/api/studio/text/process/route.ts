import { streamText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export const runtime = "nodejs"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const processSchema = z.object({
  text: z.string().min(1).max(10000),
  instruction: z.string().min(1).max(500),
})

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

  const parsed = processSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { text, instruction } = parsed.data

  const systemPrompt = `You are an expert editor and writing assistant for solo founders.
Your task is to improve text based on specific instructions.
Return ONLY the improved text without any explanations or commentary.
Maintain the original meaning and intent while making the requested improvements.`

  try {
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: `Instruction: ${instruction}\n\nOriginal text:\n${text}\n\nImproved text:`,
      maxOutputTokens: Math.max(text.length * 2, 500),
      temperature: 0.5,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI processing failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
