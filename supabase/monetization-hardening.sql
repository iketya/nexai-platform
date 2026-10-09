-- Apply once in the production Supabase SQL Editor before deploying the
-- matching application release. This protects agent prompts and creates an
-- immutable-for-users usage ledger, so deleting a conversation cannot reset
-- the Free/Pro chat allowance.
begin;

revoke select on table public.agents from public, anon, authenticated;
revoke select (system_prompt) on table public.agents from public, anon, authenticated;
grant select (
  id, creator_id, name, slug, description, icon, category, tone,
  is_public, created_at, updated_at
) on table public.agents to anon, authenticated;
revoke insert on table public.agents from public, anon, authenticated;
grant insert on table public.agents to service_role;

create table if not exists public.agent_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, agent_id)
);
create index if not exists agent_favorites_user_created_idx
on public.agent_favorites (user_id, created_at desc);
alter table public.agent_favorites enable row level security;
revoke all on table public.agent_favorites from public, anon, authenticated;
grant select on table public.agent_favorites to authenticated;
grant select, insert, delete on table public.agent_favorites to service_role;
drop policy if exists agent_favorites_select_own on public.agent_favorites;
create policy agent_favorites_select_own on public.agent_favorites
for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.set_agent_favorite(
  p_user_id uuid, p_agent_id uuid, p_favorite boolean, p_limit integer
)
returns text language plpgsql security invoker set search_path = '' as $$
declare v_count bigint;
begin
  if p_user_id is null or p_agent_id is null or p_favorite is null or p_limit < 1 then
    raise exception 'Invalid favorite request';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('favorite:' || p_user_id::text, 0));
  if not p_favorite then
    delete from public.agent_favorites where user_id = p_user_id and agent_id = p_agent_id;
    return 'removed';
  end if;
  if not exists (
    select 1 from public.agents
    where id = p_agent_id and (is_public or creator_id = p_user_id)
  ) then return 'not_found'; end if;
  if exists (
    select 1 from public.agent_favorites where user_id = p_user_id and agent_id = p_agent_id
  ) then return 'already_added'; end if;
  select count(*) into v_count from public.agent_favorites where user_id = p_user_id;
  if v_count >= p_limit then return 'limit'; end if;
  insert into public.agent_favorites (user_id, agent_id) values (p_user_id, p_agent_id);
  return 'added';
end;
$$;
revoke all on function public.set_agent_favorite(uuid, uuid, boolean, integer) from public, anon, authenticated;
grant execute on function public.set_agent_favorite(uuid, uuid, boolean, integer) to service_role;

create or replace function public.create_agent_with_limit(
  p_user_id uuid, p_limit integer, p_name text, p_slug text, p_description text,
  p_icon text, p_category text, p_tone text, p_system_prompt text, p_is_public boolean
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_count bigint;
begin
  if p_user_id is null or p_limit < 1 then raise exception 'Invalid agent request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('agent:' || p_user_id::text, 0));
  select count(*) into v_count from public.agents where creator_id = p_user_id;
  if v_count >= p_limit then return false; end if;
  insert into public.agents
    (creator_id, name, slug, description, icon, category, tone, system_prompt, is_public)
  values
    (p_user_id, p_name, p_slug, p_description, p_icon, p_category, p_tone, p_system_prompt, p_is_public);
  return true;
end;
$$;
revoke all on function public.create_agent_with_limit(uuid, integer, text, text, text, text, text, text, text, boolean)
from public, anon, authenticated;
grant execute on function public.create_agent_with_limit(uuid, integer, text, text, text, text, text, text, text, boolean)
to service_role;

create table if not exists public.chat_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  is_free boolean not null default true,
  legacy_message_id uuid unique
);
alter table public.chat_usage_events add column if not exists is_free boolean not null default true;

create index if not exists chat_usage_events_user_created_idx
on public.chat_usage_events (user_id, created_at desc);
create index if not exists chat_usage_events_free_created_idx
on public.chat_usage_events (created_at desc) where is_free = true;

alter table public.chat_usage_events enable row level security;
revoke all on table public.chat_usage_events from public, anon, authenticated;
grant select, insert, delete on table public.chat_usage_events to service_role;
grant delete on table public.messages to service_role;

-- Preserve existing usage for the current day/month. Re-running is safe.
insert into public.chat_usage_events (user_id, created_at, legacy_message_id)
select c.user_id, m.created_at, m.id
from public.messages as m
join public.conversations as c on c.id = m.conversation_id
where m.role = 'user'
on conflict (legacy_message_id) do nothing;

drop function if exists public.reserve_chat_usage(uuid, integer, integer, timestamptz, timestamptz);
create or replace function public.reserve_chat_usage(
  p_user_id uuid,
  p_daily_limit integer,
  p_monthly_limit integer,
  p_day_start timestamptz,
  p_month_start timestamptz,
  p_is_free boolean,
  p_global_free_monthly_limit integer
)
returns table (allowed boolean, reason text, event_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_daily bigint;
  v_monthly bigint;
  v_global_free_monthly bigint;
  v_event_id uuid;
begin
  if p_user_id is null or p_daily_limit < 1 or p_monthly_limit < 1
    or p_is_free is null or p_global_free_monthly_limit < 1 then
    raise exception 'Invalid chat allowance request';
  end if;

  -- Serialize reservations for the same user across concurrent requests.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  if p_is_free then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('global-free-chat', 0));
    select count(*) into v_global_free_monthly
    from public.chat_usage_events
    where is_free = true and created_at >= p_month_start;
    if v_global_free_monthly >= p_global_free_monthly_limit then
      return query select false, 'global_free'::text, null::uuid;
      return;
    end if;
  end if;

  select count(*) into v_daily
  from public.chat_usage_events
  where user_id = p_user_id and created_at >= p_day_start;
  if v_daily >= p_daily_limit then
    return query select false, 'daily'::text, null::uuid;
    return;
  end if;

  select count(*) into v_monthly
  from public.chat_usage_events
  where user_id = p_user_id and created_at >= p_month_start;
  if v_monthly >= p_monthly_limit then
    return query select false, 'monthly'::text, null::uuid;
    return;
  end if;

  insert into public.chat_usage_events (user_id, is_free)
  values (p_user_id, p_is_free)
  returning id into v_event_id;

  return query select true, null::text, v_event_id;
end;
$$;

revoke all on function public.reserve_chat_usage(uuid, integer, integer, timestamptz, timestamptz, boolean, integer)
from public, anon, authenticated;
grant execute on function public.reserve_chat_usage(uuid, integer, integer, timestamptz, timestamptz, boolean, integer)
to service_role;

do $$
begin
  if has_column_privilege('anon', 'public.agents', 'system_prompt', 'SELECT')
    or has_column_privilege('authenticated', 'public.agents', 'system_prompt', 'SELECT')
    or not has_column_privilege('service_role', 'public.agents', 'system_prompt', 'SELECT')
    or has_function_privilege('anon', 'public.reserve_chat_usage(uuid,integer,integer,timestamptz,timestamptz,boolean,integer)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.reserve_chat_usage(uuid,integer,integer,timestamptz,timestamptz,boolean,integer)', 'EXECUTE')
    or has_table_privilege('anon', 'public.chat_usage_events', 'SELECT')
    or has_table_privilege('authenticated', 'public.chat_usage_events', 'SELECT')
    or has_table_privilege('authenticated', 'public.agent_favorites', 'INSERT')
    or has_function_privilege('authenticated', 'public.set_agent_favorite(uuid,uuid,boolean,integer)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.create_agent_with_limit(uuid,integer,text,text,text,text,text,text,text,boolean)', 'EXECUTE')
    or has_table_privilege('authenticated', 'public.agents', 'INSERT') then
    raise exception 'Production access control is not safely configured';
  end if;
end
$$;

commit;

-- Expected: false / false / true for prompt access; false for all seven
-- browser-write/access flags.
select
  has_column_privilege('anon', 'public.agents', 'system_prompt', 'SELECT') as anon_prompt,
  has_column_privilege('authenticated', 'public.agents', 'system_prompt', 'SELECT') as user_prompt,
  has_column_privilege('service_role', 'public.agents', 'system_prompt', 'SELECT') as server_prompt,
  has_function_privilege('anon', 'public.reserve_chat_usage(uuid,integer,integer,timestamptz,timestamptz,boolean,integer)', 'EXECUTE') as anon_reserve,
  has_function_privilege('authenticated', 'public.reserve_chat_usage(uuid,integer,integer,timestamptz,timestamptz,boolean,integer)', 'EXECUTE') as user_reserve,
  has_table_privilege('authenticated', 'public.chat_usage_events', 'SELECT') as user_usage_read,
  has_table_privilege('authenticated', 'public.agent_favorites', 'INSERT') as user_favorite_write,
  has_function_privilege('authenticated', 'public.set_agent_favorite(uuid,uuid,boolean,integer)', 'EXECUTE') as user_favorite_rpc,
  has_function_privilege('authenticated', 'public.create_agent_with_limit(uuid,integer,text,text,text,text,text,text,text,boolean)', 'EXECUTE') as user_create_rpc,
  has_table_privilege('authenticated', 'public.agents', 'INSERT') as user_agent_insert;
