import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

const generateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  style: z.enum(["realistic", "cartoon", "abstract", "digital-art", "oil-painting"]).default("realistic"),
  aspectRatio: z.enum(["square", "portrait", "landscape", "wide"]).default("square"),
})

const STYLE_PREFIXES: Record<string, string> = {
  realistic: "photorealistic, highly detailed, professional photography,",
  cartoon: "cartoon style, vibrant colors, clean lines,",
  abstract: "abstract art, creative, artistic interpretation,",
  "digital-art": "digital art, concept art, highly detailed digital illustration,",
  "oil-painting": "oil painting style, brushstrokes visible, classical art,",
}

const ASPECT_RATIOS: Record<string, string> = {
  square: "square_hd",
  portrait: "portrait_4_3",
  landscape: "landscape_16_9",
  wide: "landscape_16_9",
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = generateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { prompt, style, aspectRatio } = parsed.data

    // Build the enhanced prompt with style
    const enhancedPrompt = `${STYLE_PREFIXES[style]} ${prompt}`

    // Generate image using the fal schnell model
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: enhancedPrompt,
        image_size: ASPECT_RATIOS[aspectRatio],
        num_inference_steps: 4,
        num_images: 1,
      },
    }) as { images?: { url: string }[] }

    // Extract the image URL from the result
    const imageUrl = result.images?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    return NextResponse.json({ imageUrl, prompt: enhancedPrompt })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    )
  }
}
