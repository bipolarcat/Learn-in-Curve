-- PFQ free mock exam: question bank, attempts, answers.
-- Apply in Supabase SQL editor (or supabase db push). Service role seeds questions.
-- Clients never read answer/explanation columns — revoked below; API strips them.

create table if not exists public.pfq_questions (
  id text primary key,
  learning_outcome text not null,
  objective integer not null check (objective between 1 and 10),
  day integer not null check (day in (1, 2)),
  verb text not null,
  type text not null check (type in ('single', 'multi_select')),
  traps text[] not null default '{}',
  stem text not null,
  items jsonb,
  options jsonb not null,
  answer char(1) not null check (answer in ('a', 'b', 'c', 'd')),
  explanation text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pfq_questions_outcome_idx
  on public.pfq_questions (learning_outcome)
  where active = true;

create index if not exists pfq_questions_active_idx
  on public.pfq_questions (active);

comment on table public.pfq_questions is
  'PFQ mock bank. JSON in PFQ in 2 days/pfq-questions.json is source of truth; seed upserts here.';
comment on column public.pfq_questions.learning_outcome is
  'Syllabus outcome code (e.g. 4.10). Coverage map + mock draw key off this.';

create table if not exists public.pfq_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  guest_token text,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score integer check (score is null or score >= 0),
  question_ids text[] not null,
  constraint pfq_attempts_actor_ck check (
    user_id is not null or (guest_token is not null and length(guest_token) >= 16)
  )
);

create index if not exists pfq_attempts_user_idx
  on public.pfq_attempts (user_id, started_at desc)
  where user_id is not null;

create index if not exists pfq_attempts_guest_idx
  on public.pfq_attempts (guest_token, started_at desc)
  where guest_token is not null;

comment on table public.pfq_attempts is
  'PFQ timed mock sittings. Guests use guest_token (no PII); signed-in users use user_id.';

create table if not exists public.pfq_answers (
  attempt_id uuid not null references public.pfq_attempts (id) on delete cascade,
  question_id text not null references public.pfq_questions (id),
  selected char(1) check (selected is null or selected in ('a', 'b', 'c', 'd')),
  correct boolean,
  flagged boolean not null default false,
  option_order char(1)[] not null,
  primary key (attempt_id, question_id)
);

create index if not exists pfq_answers_attempt_idx
  on public.pfq_answers (attempt_id);

comment on column public.pfq_answers.option_order is
  'Original bank option keys in the order shown for this attempt (so review matches the sitting).';
comment on column public.pfq_answers.selected is
  'Display letter a–d for this attempt''s option_order; null = unattempted.';

alter table public.pfq_questions enable row level security;
alter table public.pfq_attempts enable row level security;
alter table public.pfq_answers enable row level security;

-- No anon/authenticated table privileges on the secret columns.
-- Service role bypasses RLS for seed + server actions.
revoke all on public.pfq_questions from anon, authenticated;
revoke all on public.pfq_attempts from anon, authenticated;
revoke all on public.pfq_answers from anon, authenticated;

-- Own-row policies for signed-in users (guests always go through service role).
-- Decision 2026-08-13 (Sim): NO client write grants on scoring data. Every product
-- path goes through service-role server actions, which bypass RLS anyway — so a
-- GRANT here buys nothing and opens a PostgREST route for a user to set their own
-- score or mark their own answers correct. The coverage map is only worth anything
-- if its numbers can't be self-reported. Read grants withheld for the same reason;
-- add SELECT back deliberately if a client-side history view is ever built.
-- No GRANTs to anon or authenticated on any pfq_* table. The revokes above stand.

-- The policies below are retained so that any future GRANT is safe by default:
-- they constrain access to own rows, and answer writes to unsubmitted attempts.
drop policy if exists pfq_attempts_select_own on public.pfq_attempts;
create policy pfq_attempts_select_own
  on public.pfq_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists pfq_attempts_update_own on public.pfq_attempts;
create policy pfq_attempts_update_own
  on public.pfq_attempts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists pfq_answers_select_own on public.pfq_answers;
create policy pfq_answers_select_own
  on public.pfq_answers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.pfq_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

drop policy if exists pfq_answers_insert_own on public.pfq_answers;
create policy pfq_answers_insert_own
  on public.pfq_answers
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.pfq_attempts a
      where a.id = attempt_id and a.user_id = auth.uid() and a.submitted_at is null
    )
  );

drop policy if exists pfq_answers_update_own on public.pfq_answers;
create policy pfq_answers_update_own
  on public.pfq_answers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.pfq_attempts a
      where a.id = attempt_id and a.user_id = auth.uid() and a.submitted_at is null
    )
  )
  with check (
    exists (
      select 1 from public.pfq_attempts a
      where a.id = attempt_id and a.user_id = auth.uid() and a.submitted_at is null
    )
  );

-- Public-safe projection (no answer / explanation). Still unused by the app —
-- kept so admins/debugging never need to grant the full table to clients.
create or replace view public.pfq_questions_public
with (security_invoker = true)
as
select
  id,
  learning_outcome,
  objective,
  day,
  verb,
  type,
  traps,
  stem,
  items,
  options,
  active
from public.pfq_questions
where active = true;

revoke all on public.pfq_questions_public from anon, authenticated;
-- Intentionally no GRANT SELECT: the mock is served only via server actions that
-- strip secrets. A table/view grant would still leak options before shuffle is fine,
-- but keeping zero client surface is the safer default for an answer-key table.
