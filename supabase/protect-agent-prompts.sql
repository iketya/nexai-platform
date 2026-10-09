-- Run once in Supabase SQL Editor for the existing production database,
-- after the updated application is deployed.
-- RLS still controls which rows are visible. Column grants keep prompts out
-- of the public Data API, including select('*') and direct REST requests.
begin;

revoke select on table public.agents from public, anon, authenticated;
revoke select (system_prompt) on table public.agents from public, anon, authenticated;

grant select (
  id, creator_id, name, slug, description, icon, category, tone,
  is_public, created_at, updated_at
) on table public.agents to anon, authenticated;

do $$
begin
  if has_column_privilege('anon', 'public.agents', 'system_prompt', 'SELECT')
    or has_column_privilege('authenticated', 'public.agents', 'system_prompt', 'SELECT')
    or not has_column_privilege('service_role', 'public.agents', 'system_prompt', 'SELECT') then
    raise exception 'Agent prompt access is not safely configured';
  end if;
end
$$;

commit;

-- Check that the only role with direct prompt read access is service_role.
select
  has_column_privilege('anon', 'public.agents', 'system_prompt', 'SELECT') as anon_can_read_prompt,
  has_column_privilege('authenticated', 'public.agents', 'system_prompt', 'SELECT') as authenticated_can_read_prompt,
  has_column_privilege('service_role', 'public.agents', 'system_prompt', 'SELECT') as service_role_can_read_prompt;
