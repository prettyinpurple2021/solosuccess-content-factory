-- drafts: content the user is working on or has saved
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- post | thread | newsletter | video | story | survey | blog
  title text,
  body text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.drafts enable row level security;

create policy "drafts_select_own" on public.drafts for select using (auth.uid() = user_id);
create policy "drafts_insert_own" on public.drafts for insert with check (auth.uid() = user_id);
create policy "drafts_update_own" on public.drafts for update using (auth.uid() = user_id);
create policy "drafts_delete_own" on public.drafts for delete using (auth.uid() = user_id);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists drafts_updated_at on public.drafts;
create trigger drafts_updated_at
  before update on public.drafts
  for each row execute function public.set_updated_at();
