-- LIC-39 / LIC-40: make the server the source of truth for mock-exam state.
-- Additive only. Apply deliberately after reviewing the existing production schema.

alter table public.exam_sessions
  add column if not exists tier text,
  add column if not exists status text,
  add column if not exists deadline_at timestamptz,
  add column if not exists break_started_at timestamptz,
  add column if not exists break_ends_at timestamptz,
  add column if not exists config_snapshot jsonb,
  add column if not exists finalized_at timestamptz;

update public.exam_sessions
set
  -- All legacy sessions belong to the original free/self-assessed paper.
  tier = coalesce(tier, 'lite'),
  status = coalesce(status, case when submitted_at is null then 'active' else 'finalized' end),
  deadline_at = coalesce(
    deadline_at,
    started_at + make_interval(mins => coalesce(time_limit_minutes, 150))
  ),
  config_snapshot = coalesce(config_snapshot, '{}'::jsonb)
where tier is null
   or status is null
   or deadline_at is null
   or config_snapshot is null;

-- Do not let already-expired legacy sessions block a new attempt forever.
update public.exam_sessions
set
  status = 'abandoned',
  submitted_at = coalesce(submitted_at, deadline_at)
where status = 'active'
  and submitted_at is null
  and deadline_at <= now();

-- Preserve resumability for legacy sessions without trusting a new client
-- snapshot. Legacy sessions served the original 40-question paper.
update public.exam_sessions es
set config_snapshot = jsonb_build_object(
  'total_marks', coalesce(es.max_score, 90),
  'pass_mark', 54,
  'pass_percentage', 60,
  'time_allowed_minutes', coalesce(es.time_limit_minutes, 150),
  'break_after_question', 20,
  'break_duration_minutes', 30,
  'question_ids', coalesce(
    (
      select jsonb_agg(q.id order by q.part, q.position)
      from public.questions q
      where q.course_id = es.course_id
        and q.context = 'mock_exam'
    ),
    '[]'::jsonb
  )
)
where es.config_snapshot = '{}'::jsonb;

alter table public.exam_sessions
  alter column tier set default 'lite',
  alter column tier set not null,
  alter column status set default 'active',
  alter column status set not null,
  alter column deadline_at set not null,
  alter column config_snapshot set default '{}'::jsonb,
  alter column config_snapshot set not null;

alter table public.attempts
  add column if not exists ai_feedback text,
  add column if not exists ai_rubric_evidence jsonb,
  add column if not exists ai_model text,
  add column if not exists ai_input_tokens integer,
  add column if not exists ai_output_tokens integer,
  add column if not exists ai_cost_gbp_cents integer,
  add column if not exists grading_status text,
  add column if not exists grading_error text,
  add column if not exists grading_attempts integer not null default 0,
  add column if not exists graded_at timestamptz;

update public.attempts
set grading_status = case
  when ai_score is not null then 'graded'
  when exists (
    select 1
    from public.questions q
    where q.id = attempts.question_id
      and q.question_type in ('short_answer', 'long_answer')
  ) then 'pending'
  else 'not_required'
end
where grading_status is null;

alter table public.attempts
  alter column grading_status set default 'not_required',
  alter column grading_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'exam_sessions_tier_check'
      and conrelid = 'public.exam_sessions'::regclass
  ) then
    alter table public.exam_sessions
      add constraint exam_sessions_tier_check
      check (tier in ('lite', 'full')) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'exam_sessions_status_check'
      and conrelid = 'public.exam_sessions'::regclass
  ) then
    alter table public.exam_sessions
      add constraint exam_sessions_status_check
      check (status in ('active', 'break', 'grading', 'finalized', 'abandoned')) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'exam_sessions_deadline_check'
      and conrelid = 'public.exam_sessions'::regclass
  ) then
    alter table public.exam_sessions
      add constraint exam_sessions_deadline_check
      check (deadline_at >= started_at) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'exam_sessions_break_check'
      and conrelid = 'public.exam_sessions'::regclass
  ) then
    alter table public.exam_sessions
      add constraint exam_sessions_break_check
      check (
        (break_started_at is null and break_ends_at is null)
        or (
          break_started_at is not null
          and break_ends_at is not null
          and break_ends_at >= break_started_at
        )
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'attempts_grading_status_check'
      and conrelid = 'public.attempts'::regclass
  ) then
    alter table public.attempts
      add constraint attempts_grading_status_check
      check (grading_status in ('not_required', 'pending', 'grading', 'graded', 'error')) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'attempts_ai_score_check'
      and conrelid = 'public.attempts'::regclass
  ) then
    alter table public.attempts
      add constraint attempts_ai_score_check
      check (ai_score is null or ai_score >= 0) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'attempts_ai_token_check'
      and conrelid = 'public.attempts'::regclass
  ) then
    alter table public.attempts
      add constraint attempts_ai_token_check
      check (
        coalesce(ai_input_tokens, 0) >= 0
        and coalesce(ai_output_tokens, 0) >= 0
        and coalesce(ai_cost_gbp_cents, 0) >= 0
        and grading_attempts >= 0
      ) not valid;
  end if;
end $$;

alter table public.exam_sessions
  validate constraint exam_sessions_tier_check,
  validate constraint exam_sessions_status_check,
  validate constraint exam_sessions_deadline_check,
  validate constraint exam_sessions_break_check;

alter table public.attempts
  validate constraint attempts_grading_status_check,
  validate constraint attempts_ai_score_check,
  validate constraint attempts_ai_token_check;

create unique index if not exists attempts_exam_session_question_uidx
  on public.attempts (exam_session_id, question_id);

create unique index if not exists exam_sessions_one_open_tier_uidx
  on public.exam_sessions (user_id, course_id, tier)
  where status in ('active', 'break', 'grading');

create index if not exists exam_sessions_deadline_idx
  on public.exam_sessions (deadline_at)
  where status in ('active', 'break', 'grading');
