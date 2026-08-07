-- Add terminal status `expired` (clock ran out) distinct from `abandoned`
-- (learner pressed abandon). Both may carry a real score after scoring on end.

alter table public.exam_sessions
  drop constraint if exists exam_sessions_status_check;

alter table public.exam_sessions
  add constraint exam_sessions_status_check
  check (status = any (array[
    'active'::text,
    'break'::text,
    'self_assessing'::text,
    'grading'::text,
    'finalized'::text,
    'abandoned'::text,
    'expired'::text
  ]));
