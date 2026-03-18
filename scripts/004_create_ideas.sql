-- ideas: swipe file / inspiration storage
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  source_url text,
  tags text[] default '{}',
  pinned boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.ideas enable row level security;

create policy "ideas_select_own" on public.ideas for select using (auth.uid() = user_id);
create policy "ideas_insert_own" on public.ideas for insert with check (auth.uid() = user_id);
create policy "ideas_update_own" on public.ideas for update using (auth.uid() = user_id);
create policy "ideas_delete_own" on public.ideas for delete using (auth.uid() = user_id);

drop trigger if exists ideas_updated_at on public.ideas;
create trigger ideas_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();
