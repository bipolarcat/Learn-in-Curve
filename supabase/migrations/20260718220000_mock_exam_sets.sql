-- Distinguish the four PMQ mock papers without mixing their question pools.
-- Contract: Exam 1 is Lite/self-assessed; Exams 2-4 are Full/AI-graded.

alter table public.questions
  add column if not exists exam_set smallint;

update public.questions
set exam_set = 1
where context = 'mock_exam'
  and exam_set is null;

update public.questions
set exam_set = null
where context is distinct from 'mock_exam'
  and exam_set is not null;

alter table public.questions
  drop constraint if exists questions_exam_set_context_check,
  add constraint questions_exam_set_context_check
    check (
      (context = 'mock_exam' and exam_set between 1 and 4)
      or
      (context is distinct from 'mock_exam' and exam_set is null)
    ) not valid;

alter table public.questions
  validate constraint questions_exam_set_context_check;

create index if not exists questions_mock_exam_set_order_idx
  on public.questions (course_id, context, exam_set, part, position);

alter table public.exam_sessions
  add column if not exists exam_set smallint;

update public.exam_sessions
set
  exam_set = coalesce(exam_set, 1),
  tier = 'lite',
  config_snapshot = jsonb_set(
    coalesce(config_snapshot, '{}'::jsonb),
    '{exam_set}',
    '1'::jsonb,
    true
  )
where exam_set is null
   or exam_set = 1;

-- The prerequisite migration may have left old, already-expired sessions open.
-- Close them so they do not permanently block a fresh Exam 1 attempt.
update public.exam_sessions
set
  status = 'abandoned',
  submitted_at = coalesce(submitted_at, deadline_at)
where status in ('active', 'break', 'grading')
  and submitted_at is null
  and deadline_at <= now();

alter table public.exam_sessions
  alter column exam_set set default 1,
  alter column exam_set set not null;

alter table public.exam_sessions
  drop constraint if exists exam_sessions_exam_set_check,
  add constraint exam_sessions_exam_set_check
    check (exam_set between 1 and 4) not valid,
  drop constraint if exists exam_sessions_tier_exam_set_check,
  add constraint exam_sessions_tier_exam_set_check
    check (
      (tier = 'lite' and exam_set = 1)
      or
      (tier = 'full' and exam_set between 2 and 4)
    ) not valid;

alter table public.exam_sessions
  validate constraint exam_sessions_exam_set_check,
  validate constraint exam_sessions_tier_exam_set_check;

-- Add the persisted free-paper marking phase to the prerequisite status model.
alter table public.exam_sessions
  drop constraint if exists exam_sessions_status_check,
  add constraint exam_sessions_status_check
    check (
      status in (
        'active',
        'break',
        'self_assessing',
        'grading',
        'finalized',
        'abandoned'
      )
    ) not valid;

alter table public.exam_sessions
  validate constraint exam_sessions_status_check;

-- Keep one open session per tier. In particular, this prevents a learner from
-- opening Exams 2, 3 and 4 simultaneously while still storing the chosen set.
drop index if exists public.exam_sessions_one_open_tier_uidx;

create unique index exam_sessions_one_open_tier_uidx
  on public.exam_sessions (user_id, course_id, tier)
  where status in ('active', 'break', 'self_assessing', 'grading');

