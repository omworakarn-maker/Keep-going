create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  start_date date not null,
  healing_started_at timestamptz not null,
  has_onboarded boolean not null default false,
  healing_goal text not null default '',
  current_feeling text not null default '',
  feeling_reason text not null default '',
  feeling_note text not null default '',
  healing_answer text not null default '',
  last_daily_welcome_date date,
  allow_early_weekly_summary boolean not null default false,
  self_reasons jsonb not null default '[]'::jsonb,
  notifications_enabled boolean not null default false,
  notification_time time not null default '20:00',
  updated_at timestamptz not null default now()
);

create table public.diary_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  created_at timestamptz not null,
  title text not null,
  content text not null,
  mood text,
  emoji text,
  primary key (user_id, id)
);

create index diary_entries_user_created_idx
  on public.diary_entries (user_id, created_at desc);

create table public.urge_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  created_at timestamptz not null,
  message text not null default '',
  kind text not null default 'message' check (kind in ('message', 'letter')),
  recipient text,
  audio_path text,
  audio_duration integer,
  primary key (user_id, id)
);

create index urge_entries_user_created_idx
  on public.urge_entries (user_id, created_at desc);

alter table public.user_settings enable row level security;
alter table public.diary_entries enable row level security;
alter table public.urge_entries enable row level security;

grant select, insert, update, delete on public.user_settings, public.diary_entries, public.urge_entries to authenticated;

create policy "Users can read their own settings" on public.user_settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own settings" on public.user_settings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own settings" on public.user_settings
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own settings" on public.user_settings
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their own diaries" on public.diary_entries
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own diaries" on public.diary_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own diaries" on public.diary_entries
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own diaries" on public.diary_entries
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their own urge entries" on public.urge_entries
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own urge entries" on public.urge_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own urge entries" on public.urge_entries
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own urge entries" on public.urge_entries
  for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('voice-notes', 'voice-notes', false)
on conflict (id) do update set public = false;

create policy "Users can read their own voice notes" on storage.objects
  for select to authenticated
  using (bucket_id = 'voice-notes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can upload their own voice notes" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'voice-notes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can update their own voice notes" on storage.objects
  for update to authenticated
  using (bucket_id = 'voice-notes' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'voice-notes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can delete their own voice notes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'voice-notes' and (storage.foldername(name))[1] = (select auth.uid())::text);
