-- scheduled_posts: publishing queue with status tracking
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,
  content_type  TEXT NOT NULL DEFAULT 'post',
  body          TEXT NOT NULL,
  media_urls    TEXT[] DEFAULT '{}',
  scheduled_at  TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'draft', -- draft | scheduled | publishing | published | failed
  platform_post_id TEXT,                        -- ID returned by platform after publish
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_own" ON public.scheduled_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "posts_insert_own" ON public.scheduled_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON public.scheduled_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.scheduled_posts FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS scheduled_posts_updated_at ON public.scheduled_posts;
CREATE TRIGGER scheduled_posts_updated_at
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
