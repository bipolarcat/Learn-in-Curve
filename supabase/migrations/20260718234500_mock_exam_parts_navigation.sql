-- Two-part mock-exam lifecycle, durable navigation and one lifetime attempt.
-- Apply only after the duplicate preflight below succeeds.

alter table public.exam_sessions
  add column if not exists current_part smallint not null default 1,
  add column if not exists current_question_id uuid references public.questions(id) on delete set null,
  add column if not exists part_1_started_at timestamptz,
  add column if not exists part_1_deadline_at timestamptz,
  add column if not exists part_1_submitted_at timestamptz,
  add column if not exists part_2_started_at timestamptz,
  add column if not exists part_2_deadline_at timestamptz,
  add column if not exists part_2_submitted_at timestamptz;

update public.exam_sessions
set
  part_1_started_at = coalesce(part_1_started_at, started_at),
  part_1_deadline_at = coalesce(
    part_1_deadline_at,
    started_at + make_interval(mins => 75)
  ),
  current_part = case
    when status in ('break', 'self_assessing', 'grading', 'finalized') then 2
    else coalesce(current_part, 1)
  end,
  part_1_submitted_at = case
    when status in ('break', 'self_assessing', 'grading', 'finalized')
      then coalesce(part_1_submitted_at, break_started_at, submitted_at, finalized_at)
    else part_1_submitted_at
  end
where part_1_started_at is null
   or part_1_deadline_at is null
   or current_part is null
   or (
     status in ('break', 'self_assessing', 'grading', 'finalized')
     and part_1_submitted_at is null
   );

alter table public.exam_sessions
  drop constraint if exists exam_sessions_current_part_check,
  add constraint exam_sessions_current_part_check
    check (current_part in (1, 2)) not valid,
  drop constraint if exists exam_sessions_part_deadlines_check,
  add constraint exam_sessions_part_deadlines_check
    check (
      part_1_deadline_at is null
      or (
        part_1_started_at is not null
        and part_1_deadline_at >= part_1_started_at
      )
    ) not valid,
  drop constraint if exists exam_sessions_part_2_deadlines_check,
  add constraint exam_sessions_part_2_deadlines_check
    check (
      part_2_deadline_at is null
      or (
        part_2_started_at is not null
        and part_2_deadline_at >= part_2_started_at
      )
    ) not valid;

alter table public.exam_sessions
  validate constraint exam_sessions_current_part_check,
  validate constraint exam_sessions_part_deadlines_check,
  validate constraint exam_sessions_part_2_deadlines_check;

create table if not exists public.exam_question_flags (
  exam_session_id uuid not null references public.exam_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (exam_session_id, question_id)
);

create index if not exists exam_question_flags_user_session_idx
  on public.exam_question_flags (user_id, exam_session_id);

alter table public.exam_question_flags enable row level security;

drop policy if exists "exam_question_flags_select_own" on public.exam_question_flags;
create policy "exam_question_flags_select_own"
  on public.exam_question_flags for select
  using (auth.uid() = user_id);

drop policy if exists "exam_question_flags_insert_own" on public.exam_question_flags;
create policy "exam_question_flags_insert_own"
  on public.exam_question_flags for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.exam_sessions es
      where es.id = exam_session_id
        and es.user_id = auth.uid()
    )
  );

drop policy if exists "exam_question_flags_delete_own" on public.exam_question_flags;
create policy "exam_question_flags_delete_own"
  on public.exam_question_flags for delete
  using (auth.uid() = user_id);

-- Starting a paper consumes its one lifetime attempt. Keep history intact:
-- fail the migration rather than deleting or silently choosing duplicate rows.
do $$
begin
  if exists (
    select 1
    from public.exam_sessions
    group by user_id, course_id, exam_set
    having count(*) > 1
  ) then
    raise exception
      'Duplicate mock sessions exist for a user/course/exam_set. Resolve them before applying lifetime-attempt uniqueness.';
  end if;
end $$;

drop index if exists public.exam_sessions_one_open_tier_uidx;

create unique index if not exists exam_sessions_one_lifetime_set_uidx
  on public.exam_sessions (user_id, course_id, exam_set);

create index if not exists exam_sessions_part_deadline_idx
  on public.exam_sessions (current_part, part_1_deadline_at, part_2_deadline_at)
  where status = 'active';
