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

create table if not exists public.chat_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  legacy_message_id uuid unique
);

create index if not exists chat_usage_events_user_created_idx
on public.chat_usage_events (user_id, created_at desc);

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

create or replace function public.reserve_chat_usage(
  p_user_id uuid,
  p_daily_limit integer,
  p_monthly_limit integer,
  p_day_start timestamptz,
  p_month_start timestamptz
)
returns table (allowed boolean, reason text, event_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_daily bigint;
  v_monthly bigint;
  v_event_id uuid;
begin
  if p_user_id is null or p_daily_limit < 1 or p_monthly_limit < 1 then
    raise exception 'Invalid chat allowance request';
  end if;

  -- Serialize reservations for the same user across concurrent requests.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

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

  insert into public.chat_usage_events (user_id)
  values (p_user_id)
  returning id into v_event_id;

  return query select true, null::text, v_event_id;
end;
$$;

revoke all on function public.reserve_chat_usage(uuid, integer, integer, timestamptz, timestamptz)
from public, anon, authenticated;
grant execute on function public.reserve_chat_usage(uuid, integer, integer, timestamptz, timestamptz)
to service_role;

do $$
begin
  if has_column_privilege('anon', 'public.agents', 'system_prompt', 'SELECT')
    or has_column_privilege('authenticated', 'public.agents', 'system_prompt', 'SELECT')
    or not has_column_privilege('service_role', 'public.agents', 'system_prompt', 'SELECT')
    or has_function_privilege('anon', 'public.reserve_chat_usage(uuid,integer,integer,timestamptz,timestamptz)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.reserve_chat_usage(uuid,integer,integer,timestamptz,timestamptz)', 'EXECUTE')
    or has_table_privilege('anon', 'public.chat_usage_events', 'SELECT')
    or has_table_privilege('authenticated', 'public.chat_usage_events', 'SELECT') then
    raise exception 'Production access control is not safely configured';
  end if;
end
$$;

commit;

-- Expected: false / false / true for prompt access; false for all three
-- browser-access flags.
select
  has_column_privilege('anon', 'public.agents', 'system_prompt', 'SELECT') as anon_prompt,
  has_column_privilege('authenticated', 'public.agents', 'system_prompt', 'SELECT') as user_prompt,
  has_column_privilege('service_role', 'public.agents', 'system_prompt', 'SELECT') as server_prompt,
  has_function_privilege('anon', 'public.reserve_chat_usage(uuid,integer,integer,timestamptz,timestamptz)', 'EXECUTE') as anon_reserve,
  has_function_privilege('authenticated', 'public.reserve_chat_usage(uuid,integer,integer,timestamptz,timestamptz)', 'EXECUTE') as user_reserve,
  has_table_privilege('authenticated', 'public.chat_usage_events', 'SELECT') as user_usage_read;
