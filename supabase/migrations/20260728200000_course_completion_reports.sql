-- LIC-65: end-of-course completion report (meter + takeaways + cached PDF path)

create table if not exists public.course_completion_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  per_lo jsonb not null,
  key_takeaways jsonb not null,
  weak_lo_notes jsonb not null,
  improvement_tips jsonb not null,
  pdf_storage_path text,
  generated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists course_completion_reports_user_course_idx
  on public.course_completion_reports (user_id, course_id);

alter table public.course_completion_reports enable row level security;

create policy "course_completion_reports_select_own"
  on public.course_completion_reports for select
  using (auth.uid() = user_id);

create policy "course_completion_reports_insert_own"
  on public.course_completion_reports for insert
  with check (auth.uid() = user_id);

create policy "course_completion_reports_update_own"
  on public.course_completion_reports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Private PDF cache — served via signed/service download only (never public).
insert into storage.buckets (id, name, public)
values ('course-reports', 'course-reports', false)
on conflict (id) do nothing;
