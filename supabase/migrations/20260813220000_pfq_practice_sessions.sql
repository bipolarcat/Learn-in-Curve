-- PFQ practice sessions + combined coverage signals.
-- Written 2026-08-13. Apply once in Supabase SQL editor (or db push).
-- Do NOT re-apply 20260813210000_pfq_practice_bank.sql — already live.

-- Sessions hold option_order server-side so practice answers cannot be forged
-- against a client-supplied shuffle.
create table if not exists public.pfq_practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  objective integer not null check (objective between 1 and 10),
  question_ids text[] not null,
  started_at timestamptz not null default now()
);

create index if not exists pfq_practice_sessions_user_idx
  on public.pfq_practice_sessions (user_id, started_at desc);

comment on table public.pfq_practice_sessions is
  'Untimed practice sittings for one learning objective. Service-role only.';

create table if not exists public.pfq_practice_answers (
  session_id uuid not null references public.pfq_practice_sessions (id) on delete cascade,
  question_id text not null references public.pfq_questions (id),
  option_order char(1)[] not null,
  selected char(1) check (selected is null or selected in ('a', 'b', 'c', 'd')),
  correct boolean,
  answered_at timestamptz,
  primary key (session_id, question_id)
);

create index if not exists pfq_practice_answers_session_idx
  on public.pfq_practice_answers (session_id);

comment on column public.pfq_practice_answers.option_order is
  'Bank option keys in display order for this practice attempt.';

-- One row per user per learning outcome. Most recent write wins
-- (practice submit or mock submit overwrites). Lesson checkpoints use source='lesson'.
create table if not exists public.pfq_coverage_signals (
  user_id uuid not null references auth.users (id) on delete cascade,
  learning_outcome text not null,
  correct boolean not null,
  source text not null check (source in ('practice', 'mock', 'lesson')),
  question_id text,
  updated_at timestamptz not null default now(),
  primary key (user_id, learning_outcome)
);

create index if not exists pfq_coverage_signals_user_idx
  on public.pfq_coverage_signals (user_id, updated_at desc);

comment on table public.pfq_coverage_signals is
  'Combined coverage map state. Resolve rule: most recent answer per outcome wins.';

alter table public.pfq_practice_sessions enable row level security;
alter table public.pfq_practice_answers enable row level security;
alter table public.pfq_coverage_signals enable row level security;

revoke all on public.pfq_practice_sessions from anon, authenticated;
revoke all on public.pfq_practice_answers from anon, authenticated;
revoke all on public.pfq_coverage_signals from anon, authenticated;

-- Policies retained so any future GRANT is safe by default (same pattern as mock).
drop policy if exists pfq_practice_sessions_select_own on public.pfq_practice_sessions;
create policy pfq_practice_sessions_select_own
  on public.pfq_practice_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists pfq_practice_answers_select_own on public.pfq_practice_answers;
create policy pfq_practice_answers_select_own
  on public.pfq_practice_answers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.pfq_practice_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists pfq_coverage_signals_select_own on public.pfq_coverage_signals;
create policy pfq_coverage_signals_select_own
  on public.pfq_coverage_signals
  for select
  to authenticated
  using (auth.uid() = user_id);
