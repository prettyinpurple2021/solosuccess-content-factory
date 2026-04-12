import { z } from "zod"

/**
 * Validation schemas for API request bodies.
 * Used to validate and sanitize user input before processing.
 */

// ─── AI Repurpose ─────────────────────────────────────────────────────────────
export const repurposeSchema = z.object({
  formatId: z.enum(["twitter", "thread", "linkedin", "newsletter", "video_script", "blog_outline"], {
    errorMap: () => ({ message: "Invalid content format" }),
  }),
  input: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(10000, "Content must be under 10,000 characters")
    .transform((val) => val.trim()),
})

export type RepurposeInput = z.infer<typeof repurposeSchema>

// ─── AI Write ─────────────────────────────────────────────────────────────────
export const writeSchema = z.object({
  type: z
    .enum(["post", "thread", "newsletter", "video", "story", "survey", "blog"])
    .default("post"),
  topic: z
    .string()
    .max(500, "Topic must be under 500 characters")
    .optional()
    .transform((val) => val?.trim()),
  existingContent: z
    .string()
    .max(10000, "Existing content must be under 10,000 characters")
    .optional()
    .transform((val) => val?.trim()),
})

export type WriteInput = z.infer<typeof writeSchema>

// ─── Publish ──────────────────────────────────────────────────────────────────
export const publishSchema = z.object({
  platforms: z
    .array(z.enum(["twitter", "facebook", "linkedin", "bluesky", "reddit"]))
    .min(1, "At least one platform is required")
    .max(5, "Maximum 5 platforms allowed"),
  body: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content must be under 10,000 characters")
    .transform((val) => val.trim()),
  contentType: z.string().max(50).default("post"),
  subreddit: z
    .string()
    .max(100)
    .optional()
    .transform((val) => val?.trim()),
})

export type PublishInput = z.infer<typeof publishSchema>

// ─── Helper to format Zod errors ──────────────────────────────────────────────
export function formatZodError(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join(", ")
}
