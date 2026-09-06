-- Run once in the Supabase SQL Editor before enabling paid plans.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'incomplete' check (
    status in ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')
  ),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
grant select on table public.subscriptions to authenticated;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
for select to authenticated
using ((select auth.uid()) = user_id);
