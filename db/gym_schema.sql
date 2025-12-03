-- Gym-only SQL schema (idempotent)
-- Compatible with existing app schema; avoids name collisions.
-- Run in Supabase SQL editor or psql.

-- ========= Helpers (safe checks) =========
create extension if not exists pgcrypto;

-- ========= Tables =========
-- Body parts
create table if not exists public.body_parts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exercises linked to body parts
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  body_part_id uuid not null references public.body_parts(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (body_part_id, name)
);

-- User-specific Gym Days (e.g., Chest Day, Leg Day)
create table if not exists public.gym_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Exercises assigned to a Gym Day with optional prescription
create table if not exists public.gym_day_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  gym_day_id uuid not null references public.gym_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  sets integer not null default 0 check (sets >= 0),
  reps integer check (reps is null or reps >= 0),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  weight numeric(10,2) check (weight is null or weight >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, gym_day_id, exercise_id)
);

-- Day assignments: which body part (or focus) is assigned per calendar date
create table if not exists public.gym_day_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day_date date not null,
  body_part_id uuid not null references public.body_parts(id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day_date)
);

-- Exercise details performed for a user on a specific day
create table if not exists public.gym_exercise_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day_date date not null,
  exercise_id uuid not null references public.exercises(id),
  sets integer not null default 0 check (sets >= 0),
  reps_per_set integer check (reps_per_set is null or reps_per_set >= 0),
  weight numeric(10,2) check (weight is null or weight >= 0),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day_date, exercise_id)
);

-- ========= Updated-at triggers =========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

-- Attach triggers (create if not exists pattern via names)
-- Body parts
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_body_parts_updated_at'
  ) then
    create trigger trg_body_parts_updated_at
    before update on public.body_parts
    for each row execute function public.set_updated_at();
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_gym_days_updated_at'
  ) then
    create trigger trg_gym_days_updated_at
    before update on public.gym_days
    for each row execute function public.set_updated_at();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_gym_day_exercises_updated_at'
  ) then
    create trigger trg_gym_day_exercises_updated_at
    before update on public.gym_day_exercises
    for each row execute function public.set_updated_at();
  end if;
end$$;

-- Exercises
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_exercises_updated_at'
  ) then
    create trigger trg_exercises_updated_at
    before update on public.exercises
    for each row execute function public.set_updated_at();
  end if;
end$$;

-- Day assignments
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_gym_day_assignments_updated_at'
  ) then
    create trigger trg_gym_day_assignments_updated_at
    before update on public.gym_day_assignments
    for each row execute function public.set_updated_at();
  end if;
end$$;

-- Exercise details
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_gym_exercise_details_updated_at'
  ) then
    create trigger trg_gym_exercise_details_updated_at
    before update on public.gym_exercise_details
    for each row execute function public.set_updated_at();
  end if;
end$$;

-- ========= RLS =========
-- Enable RLS
alter table public.gym_day_assignments enable row level security;
alter table public.gym_exercise_details enable row level security;

-- Policy helpers: Using Supabase auth.uid() for user scoping
create or replace function public.is_owner(uid uuid)
returns boolean language sql immutable as $$
  select uid = auth.uid();
$$;

-- gym_day_assignments policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gym_day_assignments' and policyname='Gym Day Assignments Select Own'
  ) then
    create policy "Gym Day Assignments Select Own" on public.gym_day_assignments
    for select using (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gym_day_assignments' and policyname='Gym Day Assignments Modify Own'
  ) then
    create policy "Gym Day Assignments Modify Own" on public.gym_day_assignments
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end$$;

-- gym_exercise_details policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gym_exercise_details' and policyname='Gym Exercise Details Select Own'
  ) then
    create policy "Gym Exercise Details Select Own" on public.gym_exercise_details
    for select using (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gym_exercise_details' and policyname='Gym Exercise Details Modify Own'
  ) then
    create policy "Gym Exercise Details Modify Own" on public.gym_exercise_details
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end$$;

-- Body parts and exercises are global reference data; allow read to all, restrict writes to service role.
alter table public.body_parts enable row level security;
alter table public.exercises enable row level security;
alter table public.gym_days enable row level security;
alter table public.gym_day_exercises enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='body_parts' and policyname='Body Parts Read All'
  ) then
    create policy "Body Parts Read All" on public.body_parts for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='exercises' and policyname='Exercises Read All'
  ) then
    create policy "Exercises Read All" on public.exercises for select using (true);
  end if;
end$$;

-- gym_days policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gym_days' and policyname='Gym Days Select Own'
  ) then
    create policy "Gym Days Select Own" on public.gym_days for select using (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gym_days' and policyname='Gym Days Modify Own'
  ) then
    create policy "Gym Days Modify Own" on public.gym_days for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end$$;

-- gym_day_exercises policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gym_day_exercises' and policyname='Gym Day Exercises Select Own'
  ) then
    create policy "Gym Day Exercises Select Own" on public.gym_day_exercises for select using (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gym_day_exercises' and policyname='Gym Day Exercises Modify Own'
  ) then
    create policy "Gym Day Exercises Modify Own" on public.gym_day_exercises for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end$$;

-- ========= Convenience view =========
-- Combines day assignments with exercise details for the user
create or replace view public.gym_day_exercises_view as
select
  d.user_id,
  d.day_date,
  bp.name as body_part,
  e.id as exercise_id,
  e.name as exercise_name,
  e.description as exercise_description,
  ed.sets,
  ed.reps_per_set,
  ed.weight,
  ed.duration_minutes,
  ed.notes,
  d.note as day_note
from public.gym_day_assignments d
left join public.body_parts bp on bp.id = d.body_part_id
left join public.gym_exercise_details ed on ed.user_id = d.user_id and ed.day_date = d.day_date
left join public.exercises e on e.id = ed.exercise_id;

-- ========= Indexes =========
create index if not exists idx_gym_day_assignments_user_date on public.gym_day_assignments(user_id, day_date);
create index if not exists idx_gym_exercise_details_user_date on public.gym_exercise_details(user_id, day_date);
create index if not exists idx_exercises_body_part on public.exercises(body_part_id);
create index if not exists idx_gym_days_user on public.gym_days(user_id);
create index if not exists idx_gym_day_exercises_user_day on public.gym_day_exercises(user_id, gym_day_id);

-- ========= RPC helpers (optional) =========
-- Admin-safe inserts via security definer to bypass RLS on reference tables
create or replace function public.add_body_part(p_name text)
returns uuid language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  return null;
end;
$$;
-- Redefine with body to ensure search_path, then perform insert
create or replace function public.add_body_part(p_name text)
returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  perform set_config('search_path', 'public', true);
  insert into public.body_parts(name) values (p_name) returning id into new_id;
  return new_id;
end;$$;

create or replace function public.add_exercise(p_name text, p_body_part uuid, p_desc text default null)
returns uuid language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  return null;
end;
$$;
create or replace function public.add_exercise(p_name text, p_body_part uuid, p_desc text default null)
returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  perform set_config('search_path', 'public', true);
  insert into public.exercises(name, body_part_id, description)
  values (p_name, p_body_part, p_desc) returning id into new_id;
  return new_id;
end;$$;

-- ========= Exercise Templates =========
-- Stores default prescription per exercise (sets x reps OR sets x time, optional weight)
create table if not exists public.exercise_templates (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  default_sets integer not null default 0 check (default_sets >= 0),
  default_reps integer check (default_reps is null or default_reps >= 0),
  default_duration_minutes integer check (default_duration_minutes is null or default_duration_minutes >= 0),
  default_weight numeric(10,2) check (default_weight is null or default_weight >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exercise_id)
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_exercise_templates_updated_at'
  ) then
    create trigger trg_exercise_templates_updated_at
    before update on public.exercise_templates
    for each row execute function public.set_updated_at();
  end if;
end$$;

alter table public.exercise_templates enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='exercise_templates' and policyname='Exercise Templates Read All'
  ) then
    create policy "Exercise Templates Read All" on public.exercise_templates for select using (true);
  end if;
end$$;

create index if not exists idx_exercise_templates_exercise on public.exercise_templates(exercise_id);

-- Helper view to list templates with exercise/body part names
create or replace view public.exercise_templates_view as
select
  et.id,
  et.exercise_id,
  e.name as exercise_name,
  e.body_part_id,
  bp.name as body_part_name,
  et.default_sets,
  et.default_reps,
  et.default_duration_minutes,
  et.default_weight,
  et.notes,
  et.created_at,
  et.updated_at
from public.exercise_templates et
join public.exercises e on e.id = et.exercise_id
left join public.body_parts bp on bp.id = e.body_part_id;

-- Upsert template via security definer
create or replace function public.upsert_exercise_template(
  p_exercise uuid,
  p_sets integer default 0,
  p_reps integer default null,
  p_duration integer default null,
  p_weight numeric(10,2) default null,
  p_notes text default null
) returns uuid language plpgsql security definer as $$
declare res_id uuid;
begin
  perform set_config('search_path', 'public', true);
  insert into public.exercise_templates(exercise_id, default_sets, default_reps, default_duration_minutes, default_weight, notes)
  values (p_exercise, coalesce(p_sets,0), p_reps, p_duration, p_weight, p_notes)
  on conflict (exercise_id)
  do update set default_sets = excluded.default_sets,
               default_reps = excluded.default_reps,
               default_duration_minutes = excluded.default_duration_minutes,
               default_weight = excluded.default_weight,
               notes = excluded.notes,
               updated_at = now()
  returning id into res_id;
  return res_id;
end;$$;

-- CRUD RPCs for Gym Days
create or replace function public.create_gym_day(p_name text)
returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  perform set_config('search_path', 'public', true);
  insert into public.gym_days(user_id, name) values (auth.uid(), p_name) returning id into new_id;
  return new_id;
end;$$;

create or replace function public.update_gym_day(p_id uuid, p_name text)
returns void language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  update public.gym_days set name = p_name, updated_at = now() where id = p_id and user_id = auth.uid();
end;$$;

create or replace function public.delete_gym_day(p_id uuid)
returns void language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  delete from public.gym_days where id = p_id and user_id = auth.uid();
end;$$;

-- CRUD RPCs for assigning exercises to a Gym Day
create or replace function public.assign_exercise_to_day(
  p_day_id uuid,
  p_exercise_id uuid,
  p_sets integer default 0,
  p_reps integer default null,
  p_duration integer default null,
  p_weight numeric(10,2) default null,
  p_note text default null
) returns void language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  insert into public.gym_day_exercises(user_id, gym_day_id, exercise_id, sets, reps, duration_minutes, weight, note)
  values (auth.uid(), p_day_id, p_exercise_id, coalesce(p_sets,0), p_reps, p_duration, p_weight, p_note)
  on conflict (user_id, gym_day_id, exercise_id)
  do update set sets = excluded.sets,
               reps = excluded.reps,
               duration_minutes = excluded.duration_minutes,
               weight = excluded.weight,
               note = excluded.note,
               updated_at = now();
end;$$;

create or replace function public.remove_exercise_from_day(p_day_id uuid, p_exercise_id uuid)
returns void language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  delete from public.gym_day_exercises where user_id = auth.uid() and gym_day_id = p_day_id and exercise_id = p_exercise_id;
end;$$;

-- Explicit update RPC for a day exercise (alternative to assign)
create or replace function public.update_day_exercise(
  p_day_id uuid,
  p_exercise_id uuid,
  p_sets integer default null,
  p_reps integer default null,
  p_duration integer default null,
  p_weight numeric(10,2) default null,
  p_note text default null
) returns void language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  update public.gym_day_exercises
     set sets = coalesce(p_sets, sets),
         reps = coalesce(p_reps, reps),
         duration_minutes = coalesce(p_duration, duration_minutes),
         weight = coalesce(p_weight, weight),
         note = coalesce(p_note, note),
         updated_at = now()
   where user_id = auth.uid() and gym_day_id = p_day_id and exercise_id = p_exercise_id;
end;$$;

-- Read helpers for clean API
create or replace function public.list_gym_days()
returns table(id uuid, name text, created_at timestamptz, updated_at timestamptz) language sql security definer as $$
  select gd.id, gd.name, gd.created_at, gd.updated_at
  from public.gym_days gd
  where gd.user_id = auth.uid()
  order by gd.created_at asc;
$$;

create or replace function public.list_exercises_for_day(p_day_id uuid)
returns table(
  id uuid,
  exercise_id uuid,
  exercise_name text,
  sets integer,
  reps integer,
  duration_minutes integer,
  weight numeric,
  note text,
  created_at timestamptz,
  updated_at timestamptz
) language sql security definer as $$
  select gde.id,
         gde.exercise_id,
         e.name as exercise_name,
         gde.sets,
         gde.reps,
         gde.duration_minutes,
         gde.weight,
         gde.note,
         gde.created_at,
         gde.updated_at
    from public.gym_day_exercises gde
    join public.exercises e on e.id = gde.exercise_id
   where gde.user_id = auth.uid() and gde.gym_day_id = p_day_id
   order by e.name asc;
$$;

-- Assign a body part to a day; upsert
create or replace function public.assign_body_part_to_day(day date, body_part uuid)
returns void language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  insert into public.gym_day_assignments(user_id, day_date, body_part_id)
  values (auth.uid(), day, body_part)
  on conflict (user_id, day_date)
  do update set body_part_id = excluded.body_part_id, updated_at = now();
end;$$;

-- Add or update exercise detail for the day
create or replace function public.upsert_exercise_detail(
  day date,
  exercise uuid,
  p_sets integer default 0,
  p_reps integer default null,
  p_weight numeric(10,2) default null,
  p_duration integer default null,
  p_notes text default null
) returns void language plpgsql security definer as $$
begin
  perform set_config('search_path', 'public', true);
  insert into public.gym_exercise_details(user_id, day_date, exercise_id, sets, reps_per_set, weight, duration_minutes, notes)
  values (auth.uid(), day, exercise, coalesce(p_sets,0), p_reps, p_weight, p_duration, p_notes)
  on conflict (user_id, day_date, exercise_id)
  do update set sets = excluded.sets,
               reps_per_set = excluded.reps_per_set,
               weight = excluded.weight,
               duration_minutes = excluded.duration_minutes,
               notes = excluded.notes,
               updated_at = now();
end;$$;

-- ========= Grants for PostgREST visibility and function execution =========
do $$
begin
  -- Allow authenticated users to execute RPCs
  grant execute on function public.add_body_part(text) to authenticated;
  grant execute on function public.add_exercise(text, uuid, text) to authenticated;
  grant execute on function public.upsert_exercise_template(uuid, integer, integer, integer, numeric, text) to authenticated;
  grant execute on function public.assign_body_part_to_day(date, uuid) to authenticated;
  grant execute on function public.upsert_exercise_detail(date, uuid, integer, integer, numeric, integer, text) to authenticated;
  grant execute on function public.create_gym_day(text) to authenticated;
  grant execute on function public.update_gym_day(uuid, text) to authenticated;
  grant execute on function public.delete_gym_day(uuid) to authenticated;
  grant execute on function public.assign_exercise_to_day(uuid, uuid, integer, integer, integer, numeric, text) to authenticated;
  grant execute on function public.remove_exercise_from_day(uuid, uuid) to authenticated;
  grant execute on function public.update_day_exercise(uuid, uuid, integer, integer, integer, numeric, text) to authenticated;
  grant execute on function public.list_gym_days() to authenticated;
  grant execute on function public.list_exercises_for_day(uuid) to authenticated;
end$$;
