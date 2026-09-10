-- Run this once in the Supabase SQL Editor for an existing NexAI project.
-- It prevents browser clients from editing or deleting individual messages,
-- which protects the server-side daily usage limit.

revoke update, delete on table public.messages from authenticated;

grant select, insert, update, delete on table public.conversations to authenticated;
grant select, insert on table public.messages to authenticated;
grant select on table public.conversations, public.messages to service_role;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "conversations_select_own" on public.conversations;
drop policy if exists "conversations_insert_own" on public.conversations;
drop policy if exists "conversations_update_own" on public.conversations;
drop policy if exists "conversations_delete_own" on public.conversations;

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

drop policy if exists "messages_select_own_conversation" on public.messages;
drop policy if exists "messages_insert_own_conversation" on public.messages;

create policy "messages_select_own_conversation" on public.messages
for select to authenticated
using (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
  )
);

create policy "messages_insert_own_conversation" on public.messages
for insert to authenticated
with check (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
  )
);

drop policy if exists "messages_delete_own_conversation" on public.messages;

create index if not exists messages_role_created_idx
on public.messages (role, created_at desc);

alter table public.messages
drop constraint if exists messages_content_length_check;

alter table public.messages
add constraint messages_content_length_check
check (char_length(content) between 1 and 20000);

-- Trigger functions do not need to be callable through the public Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;
