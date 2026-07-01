-- ============================================================
-- Family Planner – Initial Schema
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null,
  push_subscription jsonb,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Authenticated users can read all profiles
create policy "profiles_select" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Users can only update their own profile
create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- Users can insert their own profile
create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'User'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists public.tasks (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  assigned_to   uuid references public.profiles(id),
  created_by    uuid references public.profiles(id),
  due_date      date,
  priority      text not null default 'medium' check (priority in ('low','medium','high')),
  is_done       boolean not null default false,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.tasks enable row level security;

-- All authenticated users can view all tasks (shared household)
create policy "tasks_select" on public.tasks
  for select using (auth.role() = 'authenticated');

create policy "tasks_insert" on public.tasks
  for insert with check (auth.role() = 'authenticated');

create policy "tasks_update" on public.tasks
  for update using (auth.role() = 'authenticated');

create policy "tasks_delete" on public.tasks
  for delete using (auth.role() = 'authenticated');

create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

-- ============================================================
-- EVENTS
-- ============================================================
create table if not exists public.events (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  description         text,
  location            text,
  start_datetime      timestamptz not null,
  end_datetime        timestamptz not null,
  all_day             boolean not null default false,
  created_by          uuid references public.profiles(id),
  color               text default '#4f46e5',
  recurrence_rule     text,           -- iCal RRULE string
  recurrence_end_date date,
  reminder_minutes    integer,        -- minutes before start
  created_at          timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events_select" on public.events
  for select using (auth.role() = 'authenticated');

create policy "events_insert" on public.events
  for insert with check (auth.role() = 'authenticated');

create policy "events_update" on public.events
  for update using (auth.role() = 'authenticated');

create policy "events_delete" on public.events
  for delete using (auth.role() = 'authenticated');

create index if not exists events_start_idx on public.events(start_datetime);

-- ============================================================
-- COMMENTS
-- ============================================================
create table if not exists public.comments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid references public.tasks(id) on delete cascade,
  event_id    uuid references public.events(id) on delete cascade,
  user_id     uuid not null references public.profiles(id),
  content     text not null,
  created_at  timestamptz not null default now(),

  constraint comment_belongs_to_one check (
    (task_id is not null)::int + (event_id is not null)::int = 1
  )
);

alter table public.comments enable row level security;

create policy "comments_select" on public.comments
  for select using (auth.role() = 'authenticated');

create policy "comments_insert" on public.comments
  for insert with check (auth.role() = 'authenticated');

create policy "comments_delete" on public.comments
  for delete using (auth.uid() = user_id);

create index if not exists comments_task_idx  on public.comments(task_id);
create index if not exists comments_event_idx on public.comments(event_id);

-- ============================================================
-- NUDGES
-- ============================================================
create table if not exists public.nudges (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid references public.tasks(id) on delete cascade,
  from_user   uuid not null references public.profiles(id),
  to_user     uuid not null references public.profiles(id),
  created_at  timestamptz not null default now()
);

alter table public.nudges enable row level security;

create policy "nudges_select" on public.nudges
  for select using (auth.role() = 'authenticated');

create policy "nudges_insert" on public.nudges
  for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- REALTIME: enable for all tables
-- ============================================================
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.nudges;
