-- Run once in the production Supabase SQL Editor before deploying the matching app.
-- Token counts and conservative USD estimates contain no prompt or conversation text.
begin;

alter table public.chat_usage_events
  add column if not exists model text,
  add column if not exists input_tokens integer,
  add column if not exists output_tokens integer,
  add column if not exists estimated_cost_usd_micros bigint,
  add column if not exists completed_at timestamptz;

create index if not exists chat_usage_events_created_cost_idx
on public.chat_usage_events (created_at)
include (is_free, estimated_cost_usd_micros, input_tokens, output_tokens);

grant update on table public.chat_usage_events to service_role;
revoke all on table public.chat_usage_events from public, anon, authenticated;

create or replace function public.chat_cost_summary(p_month_start timestamptz)
returns table (
  estimated_cost_usd_micros bigint,
  free_cost_usd_micros bigint,
  pro_cost_usd_micros bigint,
  measured_requests bigint,
  unmeasured_requests bigint,
  input_tokens bigint,
  output_tokens bigint
)
language sql stable security invoker set search_path = '' as $$
  select
    coalesce(sum(estimated_cost_usd_micros), 0)::bigint,
    coalesce(sum(estimated_cost_usd_micros) filter (where is_free), 0)::bigint,
    coalesce(sum(estimated_cost_usd_micros) filter (where not is_free), 0)::bigint,
    count(*) filter (where estimated_cost_usd_micros is not null)::bigint,
    count(*) filter (where estimated_cost_usd_micros is null)::bigint,
    coalesce(sum(input_tokens), 0)::bigint,
    coalesce(sum(output_tokens), 0)::bigint
  from public.chat_usage_events
  where created_at >= p_month_start;
$$;

revoke all on function public.chat_cost_summary(timestamptz) from public, anon, authenticated;
grant execute on function public.chat_cost_summary(timestamptz) to service_role;

do $$
begin
  if has_table_privilege('anon', 'public.chat_usage_events', 'SELECT')
    or has_table_privilege('authenticated', 'public.chat_usage_events', 'SELECT')
    or has_table_privilege('authenticated', 'public.chat_usage_events', 'UPDATE')
    or has_function_privilege('anon', 'public.chat_cost_summary(timestamptz)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.chat_cost_summary(timestamptz)', 'EXECUTE') then
    raise exception 'Cost metering access control is not safely configured';
  end if;
end
$$;

commit;

-- Expected: all false.
select
  has_table_privilege('authenticated', 'public.chat_usage_events', 'SELECT') as user_usage_read,
  has_table_privilege('authenticated', 'public.chat_usage_events', 'UPDATE') as user_usage_update,
  has_function_privilege('authenticated', 'public.chat_cost_summary(timestamptz)', 'EXECUTE') as user_cost_summary;
