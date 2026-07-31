-- User profile for personalisation (dashboard, Sly greeting). Own-row RLS only.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  age smallint check (age is null or (age >= 13 and age <= 120)),
  profession text,
  target_exam_date date,
  study_goal text,
  weekly_study_hours smallint check (
    weekly_study_hours is null
    or (weekly_study_hours >= 1 and weekly_study_hours <= 80)
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
