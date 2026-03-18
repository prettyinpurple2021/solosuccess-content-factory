-- scheduled_items: content scheduled for future publishing
create table if not exists public.scheduled_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  platform text,
  scheduled_for timestamptz not null,
  draft_id uuid references public.drafts(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.scheduled_items enable row level security;

create policy "scheduled_select_own" on public.scheduled_items for select using (auth.uid() = user_id);
create policy "scheduled_insert_own" on public.scheduled_items for insert with check (auth.uid() = user_id);
create policy "scheduled_update_own" on public.scheduled_items for update using (auth.uid() = user_id);
create policy "scheduled_delete_own" on public.scheduled_items for delete using (auth.uid() = user_id);
