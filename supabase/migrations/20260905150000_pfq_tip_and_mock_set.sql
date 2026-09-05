-- PFQ bank expansion: tip (review-time exam technique) + mock_set (papers 1–3).
-- Both nullable so existing rows keep working. mock_suitable stays the eligibility
-- flag; mock_set is the paper assignment (null = practice-only).

alter table public.pfq_questions
  add column if not exists tip text,
  add column if not exists mock_set smallint;

alter table public.pfq_questions
  drop constraint if exists pfq_questions_mock_set_ck;

alter table public.pfq_questions
  add constraint pfq_questions_mock_set_ck
  check (mock_set is null or mock_set in (1, 2, 3));

create index if not exists pfq_questions_mock_set_idx
  on public.pfq_questions (mock_set)
  where mock_set is not null;

comment on column public.pfq_questions.tip is
  'Optional short exam-technique pointer. Review-time only — never served on in-progress public payloads.';
comment on column public.pfq_questions.mock_set is
  'Which timed mock paper (1, 2 or 3) this question belongs to. Null = practice bank only.';

-- Track which paper an attempt sat, so the mock picker can show last score per set
-- without inferring from question ids.
alter table public.pfq_attempts
  add column if not exists mock_set smallint;

alter table public.pfq_attempts
  drop constraint if exists pfq_attempts_mock_set_ck;

alter table public.pfq_attempts
  add constraint pfq_attempts_mock_set_ck
  check (mock_set is null or mock_set in (1, 2, 3));

comment on column public.pfq_attempts.mock_set is
  'Mock paper number (1–3) for this sitting. Null on legacy attempts before set papers.';
