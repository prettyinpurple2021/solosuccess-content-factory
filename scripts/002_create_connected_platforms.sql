-- connected_platforms: stores which social accounts a user has linked
create table if not exists public.connected_platforms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform_key text not null,
  username text not null,
  connected_at timestamptz default now() not null,
  unique(user_id, platform_key)
);

alter table public.connected_platforms enable row level security;

create policy "platforms_select_own" on public.connected_platforms for select using (auth.uid() = user_id);
create policy "platforms_insert_own" on public.connected_platforms for insert with check (auth.uid() = user_id);
create policy "platforms_update_own" on public.connected_platforms for update using (auth.uid() = user_id);
create policy "platforms_delete_own" on public.connected_platforms for delete using (auth.uid() = user_id);
