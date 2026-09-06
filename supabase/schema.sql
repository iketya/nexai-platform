create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  slug text not null unique,
  description text not null default '' check (char_length(description) <= 300),
  icon text not null default '🤖' check (char_length(icon) <= 16),
  category text not null default 'その他',
  system_prompt text not null check (char_length(system_prompt) between 10 and 5000),
  tone text not null default 'やさしく丁寧',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  title text not null default '新しい会話' check (char_length(title) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 20000),
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_agent_updated_idx
on public.conversations (user_id, agent_id, updated_at desc);

create index if not exists messages_conversation_created_idx
on public.messages (conversation_id, created_at asc);

create index if not exists messages_role_created_idx
on public.messages (role, created_at desc);

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

grant select, insert, update on table public.profiles to authenticated;
grant select on table public.agents to anon, authenticated;
grant insert, update, delete on table public.agents to authenticated;
grant select, insert, update, delete on table public.conversations to authenticated;
grant select, insert on table public.messages to authenticated;

create policy "profiles_select_own" on public.profiles
for select to authenticated using ((select auth.uid()) = id);

create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "agents_read_public_or_own" on public.agents
for select to anon, authenticated
using (is_public or (select auth.uid()) = creator_id);

create policy "agents_insert_own" on public.agents
for insert to authenticated
with check ((select auth.uid()) = creator_id);

create policy "agents_update_own" on public.agents
for update to authenticated
using ((select auth.uid()) = creator_id)
with check ((select auth.uid()) = creator_id);

create policy "agents_delete_own" on public.agents
for delete to authenticated
using ((select auth.uid()) = creator_id);

create policy "conversations_select_own" on public.conversations
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "conversations_insert_own" on public.conversations
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "conversations_update_own" on public.conversations
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "conversations_delete_own" on public.conversations
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "messages_select_own_conversation" on public.messages
for select to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
  )
);

create policy "messages_insert_own_conversation" on public.messages
for insert to authenticated
with check (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
  )
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
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

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
