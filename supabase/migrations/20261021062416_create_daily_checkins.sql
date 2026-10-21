create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  mood text not null,
  emoji text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create index daily_checkins_user_date_idx
  on public.daily_checkins (user_id, checkin_date desc);

alter table public.daily_checkins enable row level security;
grant select, insert, update, delete on public.daily_checkins to authenticated;

create policy "Users can read their own daily check-ins"
  on public.daily_checkins for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own daily check-ins"
  on public.daily_checkins for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own daily check-ins"
  on public.daily_checkins for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own daily check-ins"
  on public.daily_checkins for delete to authenticated
  using ((select auth.uid()) = user_id);
