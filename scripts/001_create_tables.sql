-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- ─── Auto-create profile on signup ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Connected Platforms ─────────────────────────────────────────────────────
create table if not exists public.connected_platforms (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  platform_key text not null,
  username     text not null,
  connected_at timestamptz not null default now(),
  unique (user_id, platform_key)
);

alter table public.connected_platforms enable row level security;

create policy "platforms_select_own" on public.connected_platforms for select using (auth.uid() = user_id);
create policy "platforms_insert_own" on public.connected_platforms for insert with check (auth.uid() = user_id);
create policy "platforms_update_own" on public.connected_platforms for update using (auth.uid() = user_id);
create policy "platforms_delete_own" on public.connected_platforms for delete using (auth.uid() = user_id);

-- ─── Drafts ──────────────────────────────────────────────────────────────────
create table if not exists public.drafts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in ('post','thread','newsletter','video','story','survey','blog')),
  title        text,
  body         text not null default '',
  platforms    text[] not null default '{}',
  scheduled_for timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.drafts enable row level security;

create policy "drafts_select_own" on public.drafts for select using (auth.uid() = user_id);
create policy "drafts_insert_own" on public.drafts for insert with check (auth.uid() = user_id);
create policy "drafts_update_own" on public.drafts for update using (auth.uid() = user_id);
create policy "drafts_delete_own" on public.drafts for delete using (auth.uid() = user_id);

-- ─── Ideas / Swipe File ──────────────────────────────────────────────────────
create table if not exists public.ideas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  body       text not null default '',
  tags       text[] not null default '{}',
  source_url text,
  pinned     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ideas enable row level security;

create policy "ideas_select_own" on public.ideas for select using (auth.uid() = user_id);
create policy "ideas_insert_own" on public.ideas for insert with check (auth.uid() = user_id);
create policy "ideas_update_own" on public.ideas for update using (auth.uid() = user_id);
create policy "ideas_delete_own" on public.ideas for delete using (auth.uid() = user_id);

-- ─── Scheduled Items ─────────────────────────────────────────────────────────
create table if not exists public.scheduled_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  draft_id      uuid references public.drafts(id) on delete set null,
  type          text not null,
  title         text not null,
  scheduled_for timestamptz not null,
  platforms     text[] not null default '{}',
  created_at    timestamptz not null default now()
);

alter table public.scheduled_items enable row level security;

create policy "schedule_select_own" on public.scheduled_items for select using (auth.uid() = user_id);
create policy "schedule_insert_own" on public.scheduled_items for insert with check (auth.uid() = user_id);
create policy "schedule_update_own" on public.scheduled_items for update using (auth.uid() = user_id);
create policy "schedule_delete_own" on public.scheduled_items for delete using (auth.uid() = user_id);
