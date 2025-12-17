-- MyApp Supabase schema: tables, indexes, triggers, views, and RLS policies
-- Safe to run multiple times (idempotent guards where possible)

-- 1) Extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- 2) Enums
do $$ begin
  create type public.task_status as enum ('todo','in_progress','done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.priority_level as enum ('low','medium','high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.habit_frequency as enum ('daily','weekly','monthly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.day_flag as enum ('gym','rest');
exception when duplicate_object then null; end $$;

-- 3) Utility: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- 4) Profiles (linked 1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null), coalesce(new.raw_user_meta_data->>'avatar_url', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper functions to support single-user, no-JWT access
create or replace function public.ankan_user_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where email = 'ankan@example.com' limit 1;
$$;

create or replace function public.current_app_user()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.uid(), public.ankan_user_id());
$$;

create or replace function public.set_user_id_default()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null then
    new.user_id := public.current_app_user();
  end if;
  return new;
end;
$$;

-- RLS: users can access only their profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (public.current_app_user() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (public.current_app_user() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (public.current_app_user() = id)
  with check (public.current_app_user() = id);

-- 5) Productivity: Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  is_all_day boolean not null default false,
  status public.task_status not null default 'todo',
  priority public.priority_level not null default 'medium',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_start_at_idx on public.tasks(start_at);
create index if not exists tasks_status_idx on public.tasks(status);

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks for select
  using (public.current_app_user() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks for insert
  with check (public.current_app_user() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks for update
  using (public.current_app_user() = user_id)
  with check (public.current_app_user() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks for delete
  using (public.current_app_user() = user_id);

-- Ensure user_id is set when inserting tasks
drop trigger if exists tasks_set_user_id on public.tasks;
create trigger tasks_set_user_id
  before insert on public.tasks
  for each row execute procedure public.set_user_id_default();

-- 6) Productivity: Habits + Logs
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  frequency public.habit_frequency not null default 'daily',
  target integer not null default 1,
  color text,
  icon text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists habits_user_id_idx on public.habits(user_id);

create trigger habits_updated_at
  before update on public.habits
  for each row execute procedure public.set_updated_at();

alter table public.habits enable row level security;

drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own"
  on public.habits for select
  using (public.current_app_user() = user_id);

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own"
  on public.habits for insert
  with check (public.current_app_user() = user_id);

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own"
  on public.habits for update
  using (public.current_app_user() = user_id)
  with check (public.current_app_user() = user_id);

drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own"
  on public.habits for delete
  using (public.current_app_user() = user_id);

drop trigger if exists habits_set_user_id on public.habits;
create trigger habits_set_user_id
  before insert on public.habits
  for each row execute procedure public.set_user_id_default();

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  logged_on date not null default (timezone('utc', now()))::date,
  value integer not null default 1,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint habit_logs_unique_day unique (habit_id, logged_on)
);

create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);
create index if not exists habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index if not exists habit_logs_logged_on_idx on public.habit_logs(logged_on);

create trigger habit_logs_updated_at
  before update on public.habit_logs
  for each row execute procedure public.set_updated_at();

alter table public.habit_logs enable row level security;

-- Only the owner of the related habit can manage logs
drop policy if exists "habit_logs_select_own" on public.habit_logs;
create policy "habit_logs_select_own"
  on public.habit_logs for select
  using (
    public.current_app_user() = user_id and exists (
      select 1 from public.habits h where h.id = habit_id and h.user_id = public.current_app_user()
    )
  );

drop policy if exists "habit_logs_insert_own" on public.habit_logs;
create policy "habit_logs_insert_own"
  on public.habit_logs for insert
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.habits h where h.id = habit_id and h.user_id = public.current_app_user()
    )
  );

drop policy if exists "habit_logs_update_own" on public.habit_logs;
create policy "habit_logs_update_own"
  on public.habit_logs for update
  using (public.current_app_user() = user_id)
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.habits h where h.id = habit_id and h.user_id = public.current_app_user()
    )
  );

drop policy if exists "habit_logs_delete_own" on public.habit_logs;
create policy "habit_logs_delete_own"
  on public.habit_logs for delete
  using (public.current_app_user() = user_id);

drop trigger if exists habit_logs_set_user_id on public.habit_logs;
create trigger habit_logs_set_user_id
  before insert on public.habit_logs
  for each row execute procedure public.set_user_id_default();

-- 7) Gym: Programs, Days (Gym/Rest), Sessions, Exercises, Sets
create table if not exists public.gym_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  start_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists gym_programs_user_id_idx on public.gym_programs(user_id);

create trigger gym_programs_updated_at
  before update on public.gym_programs
  for each row execute procedure public.set_updated_at();

alter table public.gym_programs enable row level security;

drop policy if exists "gym_programs_select_own" on public.gym_programs;
create policy "gym_programs_select_own"
  on public.gym_programs for select
  using (public.current_app_user() = user_id);

drop policy if exists "gym_programs_insert_own" on public.gym_programs;
create policy "gym_programs_insert_own"
  on public.gym_programs for insert
  with check (public.current_app_user() = user_id);

drop policy if exists "gym_programs_update_own" on public.gym_programs;
create policy "gym_programs_update_own"
  on public.gym_programs for update
  using (public.current_app_user() = user_id)
  with check (public.current_app_user() = user_id);

drop policy if exists "gym_programs_delete_own" on public.gym_programs;
create policy "gym_programs_delete_own"
  on public.gym_programs for delete
  using (public.current_app_user() = user_id);

drop trigger if exists gym_programs_set_user_id on public.gym_programs;
create trigger gym_programs_set_user_id
  before insert on public.gym_programs
  for each row execute procedure public.set_user_id_default();

create table if not exists public.gym_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.gym_programs(id) on delete cascade,
  day date not null,
  flag public.day_flag not null,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint gym_days_unique unique (program_id, day)
);

create index if not exists gym_days_user_id_idx on public.gym_days(user_id);
create index if not exists gym_days_program_id_idx on public.gym_days(program_id);
create index if not exists gym_days_day_idx on public.gym_days(day);

create trigger gym_days_updated_at
  before update on public.gym_days
  for each row execute procedure public.set_updated_at();

alter table public.gym_days enable row level security;

drop policy if exists "gym_days_select_own" on public.gym_days;
create policy "gym_days_select_own"
  on public.gym_days for select
  using (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_programs p where p.id = program_id and p.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_days_insert_own" on public.gym_days;
create policy "gym_days_insert_own"
  on public.gym_days for insert
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_programs p where p.id = program_id and p.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_days_update_own" on public.gym_days;
create policy "gym_days_update_own"
  on public.gym_days for update
  using (public.current_app_user() = user_id)
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_programs p where p.id = program_id and p.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_days_delete_own" on public.gym_days;
create policy "gym_days_delete_own"
  on public.gym_days for delete
  using (public.current_app_user() = user_id);

drop trigger if exists gym_days_set_user_id on public.gym_days;
create trigger gym_days_set_user_id
  before insert on public.gym_days
  for each row execute procedure public.set_user_id_default();

create table if not exists public.gym_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid references public.gym_programs(id) on delete set null,
  session_date date not null default (timezone('utc', now()))::date,
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists gym_sessions_user_id_idx on public.gym_sessions(user_id);
create index if not exists gym_sessions_date_idx on public.gym_sessions(session_date);

create trigger gym_sessions_updated_at
  before update on public.gym_sessions
  for each row execute procedure public.set_updated_at();

alter table public.gym_sessions enable row level security;

drop policy if exists "gym_sessions_select_own" on public.gym_sessions;
create policy "gym_sessions_select_own"
  on public.gym_sessions for select
  using (public.current_app_user() = user_id);

drop policy if exists "gym_sessions_insert_own" on public.gym_sessions;
create policy "gym_sessions_insert_own"
  on public.gym_sessions for insert
  with check (public.current_app_user() = user_id);

drop policy if exists "gym_sessions_update_own" on public.gym_sessions;
create policy "gym_sessions_update_own"
  on public.gym_sessions for update
  using (public.current_app_user() = user_id)
  with check (public.current_app_user() = user_id);

drop policy if exists "gym_sessions_delete_own" on public.gym_sessions;
create policy "gym_sessions_delete_own"
  on public.gym_sessions for delete
  using (public.current_app_user() = user_id);

drop trigger if exists gym_sessions_set_user_id on public.gym_sessions;
create trigger gym_sessions_set_user_id
  before insert on public.gym_sessions
  for each row execute procedure public.set_user_id_default();

create table if not exists public.gym_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.gym_sessions(id) on delete cascade,
  name text not null,
  muscle_group text,
  order_index integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists gym_exercises_session_id_idx on public.gym_exercises(session_id);
create index if not exists gym_exercises_user_id_idx on public.gym_exercises(user_id);

create trigger gym_exercises_updated_at
  before update on public.gym_exercises
  for each row execute procedure public.set_updated_at();

alter table public.gym_exercises enable row level security;

drop policy if exists "gym_exercises_select_own" on public.gym_exercises;
create policy "gym_exercises_select_own"
  on public.gym_exercises for select
  using (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_sessions s where s.id = session_id and s.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_exercises_insert_own" on public.gym_exercises;
create policy "gym_exercises_insert_own"
  on public.gym_exercises for insert
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_sessions s where s.id = session_id and s.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_exercises_update_own" on public.gym_exercises;
create policy "gym_exercises_update_own"
  on public.gym_exercises for update
  using (public.current_app_user() = user_id)
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_sessions s where s.id = session_id and s.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_exercises_delete_own" on public.gym_exercises;
create policy "gym_exercises_delete_own"
  on public.gym_exercises for delete
  using (public.current_app_user() = user_id);

drop trigger if exists gym_exercises_set_user_id on public.gym_exercises;
create trigger gym_exercises_set_user_id
  before insert on public.gym_exercises
  for each row execute procedure public.set_user_id_default();

create table if not exists public.gym_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.gym_exercises(id) on delete cascade,
  set_index integer not null default 1,
  reps integer,
  weight numeric(6,2),
  rpe numeric(3,1),
  is_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists gym_sets_exercise_id_idx on public.gym_sets(exercise_id);
create index if not exists gym_sets_user_id_idx on public.gym_sets(user_id);

create trigger gym_sets_updated_at
  before update on public.gym_sets
  for each row execute procedure public.set_updated_at();

alter table public.gym_sets enable row level security;

drop policy if exists "gym_sets_select_own" on public.gym_sets;
create policy "gym_sets_select_own"
  on public.gym_sets for select
  using (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_exercises e where e.id = exercise_id and e.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_sets_insert_own" on public.gym_sets;
create policy "gym_sets_insert_own"
  on public.gym_sets for insert
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_exercises e where e.id = exercise_id and e.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_sets_update_own" on public.gym_sets;
create policy "gym_sets_update_own"
  on public.gym_sets for update
  using (public.current_app_user() = user_id)
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.gym_exercises e where e.id = exercise_id and e.user_id = public.current_app_user()
    )
  );

drop policy if exists "gym_sets_delete_own" on public.gym_sets;
create policy "gym_sets_delete_own"
  on public.gym_sets for delete
  using (public.current_app_user() = user_id);

drop trigger if exists gym_sets_set_user_id on public.gym_sets;
create trigger gym_sets_set_user_id
  before insert on public.gym_sets
  for each row execute procedure public.set_user_id_default();

-- 8) Learning: Tracks, Milestones, Sub-milestones
create table if not exists public.learning_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists learning_tracks_user_id_idx on public.learning_tracks(user_id);

create trigger learning_tracks_updated_at
  before update on public.learning_tracks
  for each row execute procedure public.set_updated_at();

alter table public.learning_tracks enable row level security;

drop policy if exists "learning_tracks_select_own" on public.learning_tracks;
create policy "learning_tracks_select_own"
  on public.learning_tracks for select
  using (public.current_app_user() = user_id);

drop policy if exists "learning_tracks_insert_own" on public.learning_tracks;
create policy "learning_tracks_insert_own"
  on public.learning_tracks for insert
  with check (public.current_app_user() = user_id);

drop policy if exists "learning_tracks_update_own" on public.learning_tracks;
create policy "learning_tracks_update_own"
  on public.learning_tracks for update
  using (public.current_app_user() = user_id)
  with check (public.current_app_user() = user_id);

drop policy if exists "learning_tracks_delete_own" on public.learning_tracks;
create policy "learning_tracks_delete_own"
  on public.learning_tracks for delete
  using (public.current_app_user() = user_id);

drop trigger if exists learning_tracks_set_user_id on public.learning_tracks;
create trigger learning_tracks_set_user_id
  before insert on public.learning_tracks
  for each row execute procedure public.set_user_id_default();

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.learning_tracks(id) on delete cascade,
  title text not null,
  order_index integer not null default 1,
  target_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists milestones_track_id_idx on public.milestones(track_id);
create index if not exists milestones_user_id_idx on public.milestones(user_id);

create trigger milestones_updated_at
  before update on public.milestones
  for each row execute procedure public.set_updated_at();

alter table public.milestones enable row level security;

drop policy if exists "milestones_select_own" on public.milestones;
create policy "milestones_select_own"
  on public.milestones for select
  using (
    public.current_app_user() = user_id and exists (
      select 1 from public.learning_tracks t where t.id = track_id and t.user_id = public.current_app_user()
    )
  );

drop policy if exists "milestones_insert_own" on public.milestones;
create policy "milestones_insert_own"
  on public.milestones for insert
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.learning_tracks t where t.id = track_id and t.user_id = public.current_app_user()
    )
  );

drop policy if exists "milestones_update_own" on public.milestones;
create policy "milestones_update_own"
  on public.milestones for update
  using (public.current_app_user() = user_id)
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.learning_tracks t where t.id = track_id and t.user_id = public.current_app_user()
    )
  );

drop policy if exists "milestones_delete_own" on public.milestones;
create policy "milestones_delete_own"
  on public.milestones for delete
  using (public.current_app_user() = user_id);

drop trigger if exists milestones_set_user_id on public.milestones;
create trigger milestones_set_user_id
  before insert on public.milestones
  for each row execute procedure public.set_user_id_default();

create table if not exists public.sub_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  title text not null,
  order_index integer not null default 1,
  is_done boolean not null default false,
  progress integer not null default 0 check (progress between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists sub_milestones_milestone_id_idx on public.sub_milestones(milestone_id);
create index if not exists sub_milestones_user_id_idx on public.sub_milestones(user_id);

create trigger sub_milestones_updated_at
  before update on public.sub_milestones
  for each row execute procedure public.set_updated_at();

alter table public.sub_milestones enable row level security;

drop policy if exists "sub_milestones_select_own" on public.sub_milestones;
create policy "sub_milestones_select_own"
  on public.sub_milestones for select
  using (
    public.current_app_user() = user_id and exists (
      select 1 from public.milestones m where m.id = milestone_id and m.user_id = public.current_app_user()
    )
  );

drop policy if exists "sub_milestones_insert_own" on public.sub_milestones;
create policy "sub_milestones_insert_own"
  on public.sub_milestones for insert
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.milestones m where m.id = milestone_id and m.user_id = public.current_app_user()
    )
  );

drop policy if exists "sub_milestones_update_own" on public.sub_milestones;
create policy "sub_milestones_update_own"
  on public.sub_milestones for update
  using (public.current_app_user() = user_id)
  with check (
    public.current_app_user() = user_id and exists (
      select 1 from public.milestones m where m.id = milestone_id and m.user_id = public.current_app_user()
    )
  );

drop policy if exists "sub_milestones_delete_own" on public.sub_milestones;
create policy "sub_milestones_delete_own"
  on public.sub_milestones for delete
  using (public.current_app_user() = user_id);

drop trigger if exists sub_milestones_set_user_id on public.sub_milestones;
create trigger sub_milestones_set_user_id
  before insert on public.sub_milestones
  for each row execute procedure public.set_user_id_default();

-- 9) Calendar helper: unified view for calendar items (tasks + habit logs + gym days)
create or replace view public.calendar_items as
  select
    t.id,
    t.user_id,
    'task'::text as kind,
    t.title as label,
    t.start_at as start_time,
    t.end_at as end_time,
    t.is_all_day,
    t.status::text as meta_status,
    null::text as meta_flag,
    null::uuid as related_id
  from public.tasks t
  where public.current_app_user() = t.user_id

  union all

  select
    hl.id,
    hl.user_id,
    'habit'::text as kind,
    h.name as label,
    (hl.logged_on)::timestamptz as start_time,
    ((hl.logged_on + 1))::timestamptz as end_time,
    true as is_all_day,
    'done'::text as meta_status,
    null::text as meta_flag,
    hl.habit_id as related_id
  from public.habit_logs hl
  join public.habits h on h.id = hl.habit_id
  where public.current_app_user() = hl.user_id

  union all

  select
    gd.id,
    gd.user_id,
    'gym_day'::text as kind,
    case when gd.flag = 'gym' then 'Gym Day' else 'Rest Day' end as label,
    (gd.day)::timestamptz as start_time,
    ((gd.day + 1))::timestamptz as end_time,
    true as is_all_day,
    null::text as meta_status,
    gd.flag::text as meta_flag,
    gd.program_id as related_id
  from public.gym_days gd
  where public.current_app_user() = gd.user_id;

-- 10) Learning progress helper views
create or replace view public.milestone_progress as
  select
    m.id as milestone_id,
    m.user_id,
    m.track_id,
    m.title,
    m.order_index,
    coalesce(avg(sm.progress), 0)::int as progress_pct,
    count(sm.*) filter (where sm.is_done) as done_subtasks,
    count(sm.*) as total_subtasks
  from public.milestones m
  left join public.sub_milestones sm on sm.milestone_id = m.id
  where public.current_app_user() = m.user_id
  group by m.id, m.user_id, m.track_id, m.title, m.order_index;

create or replace view public.learning_track_progress as
  select
    lt.id as track_id,
    lt.user_id,
    lt.title,
    lt.color,
    coalesce(avg(mp.progress_pct), 0)::int as progress_pct,
    sum(mp.done_subtasks) as done_subtasks,
    sum(mp.total_subtasks) as total_subtasks
  from public.learning_tracks lt
  left join public.milestone_progress mp on mp.track_id = lt.id
  where public.current_app_user() = lt.user_id
  group by lt.id, lt.user_id, lt.title, lt.color;

-- 11) Helpful grants (views rely on base table RLS; no extra grants required)
-- Supabase handles anon/authenticated roles; RLS expressions above enforce per-user access.

-- 12) Seed convenience (optional – safely no-op if row exists)
do $$ begin
  if auth.uid() is not null then
    insert into public.profiles (id, display_name)
    select auth.uid(), 'You'
    where not exists (
      select 1 from public.profiles where id = auth.uid()
    );
  end if;
end $$;

-- 13) Create a single hardcoded login (username: Ankan, password: Goal)
-- This seeds an email/password user ankan@example.com with confirmed email
-- so you can sign in immediately. Idempotent: only runs if user is missing.
do $$
declare
  v_email text := 'ankan@example.com';
  v_password text := 'Goal';
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) values (
      v_user_id,
      v_email,
      crypt(v_password, gen_salt('bf')),
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now())
    );

    -- tie the email identity to the user (required by GoTrue v2)
    insert into auth.identities (
      id,
      user_id,
      provider,
      provider_id,
      identity_data,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      'email',
      v_email,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_email,
        'email_verified', true
      ),
      timezone('utc', now()),
      timezone('utc', now())
    )
    on conflict do nothing;
  end if;
end $$;
