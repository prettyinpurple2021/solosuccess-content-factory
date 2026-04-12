import { z } from "zod"

/**
 * Runtime validation of environment variables.
 * Catches missing or invalid configuration at startup instead of at runtime.
 */

const envSchema = z.object({
  // ─── Required: Supabase ─────────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),

  // ─── Required: AI ───────────────────────────────────────────────────────────
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),

  // ─── Required: Token Encryption ─────────────────────────────────────────────
  PLATFORM_TOKEN_SECRET: z
    .string()
    .min(32, "PLATFORM_TOKEN_SECRET must be at least 32 characters")
    .optional(),

  // ─── Optional: Platform OAuth ───────────────────────────────────────────────
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),

  // ─── Optional: App URL ──────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // ─── Node Environment ───────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Validate environment at module load
function validateEnv() {
  // In development, we allow missing optional vars
  // In production, we want to be stricter
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n")

    // In production, throw to prevent startup with invalid config
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Environment validation failed:\n${errors}`)
    }

    // In development, warn but continue
    console.warn(`[env] Environment validation warnings:\n${errors}`)
  }

  return result.data ?? (process.env as z.infer<typeof envSchema>)
}

export const env = validateEnv()

// Type-safe getters for commonly used env vars
export function getSupabaseUrl(): string {
  return env.NEXT_PUBLIC_SUPABASE_URL
}

export function getSupabaseAnonKey(): string {
  return env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export function getGroqApiKey(): string {
  return env.GROQ_API_KEY
}

export function getAppUrl(): string {
  return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

export function isProduction(): boolean {
  return env.NODE_ENV === "production"
}
