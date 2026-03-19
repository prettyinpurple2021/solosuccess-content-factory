-- platform_tokens: stores encrypted OAuth access tokens per user per platform
-- Uses pgcrypto to encrypt token data at rest with a server-side secret

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.platform_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform    TEXT NOT NULL,
  -- Encrypted JSON blob: { access_token, access_token_secret, refresh_token, expires_at, username, user_id_on_platform }
  token_data  BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

ALTER TABLE public.platform_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tokens_select_own" ON public.platform_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tokens_insert_own" ON public.platform_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tokens_update_own" ON public.platform_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tokens_delete_own" ON public.platform_tokens FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS platform_tokens_updated_at ON public.platform_tokens;
CREATE TRIGGER platform_tokens_updated_at
  BEFORE UPDATE ON public.platform_tokens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
