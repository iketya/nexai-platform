-- Run this once in the Supabase SQL Editor for an existing NexAI project.
-- It prevents browser clients from editing or deleting individual messages,
-- which protects the server-side daily usage limit.

revoke update, delete on table public.messages from authenticated;

drop policy if exists "messages_delete_own_conversation" on public.messages;

create index if not exists messages_role_created_idx
on public.messages (role, created_at desc);

alter table public.messages
drop constraint if exists messages_content_length_check;

alter table public.messages
add constraint messages_content_length_check
check (char_length(content) between 1 and 20000);
