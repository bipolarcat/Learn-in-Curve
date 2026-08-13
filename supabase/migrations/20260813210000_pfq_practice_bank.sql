-- Practice question bank. One table serves both practice and the mock;
-- mock_suitable decides which questions the 60-question paper may draw.
-- Applied to the live learn-in-curve project on 2026-08-13 via MCP.
alter table public.pfq_questions
  add column if not exists mock_suitable boolean not null default false,
  add column if not exists variant integer not null default 1;

create index if not exists pfq_questions_mock_idx
  on public.pfq_questions (learning_outcome)
  where active = true and mock_suitable = true;

create index if not exists pfq_questions_practice_idx
  on public.pfq_questions (objective, learning_outcome)
  where active = true;

comment on column public.pfq_questions.mock_suitable is
  'True if this question may be drawn into the 60-question mock. Practice draws from the whole active bank.';
comment on column public.pfq_questions.variant is
  'Ordinal within a learning outcome. Variant 1 is the mock-eligible question; higher variants are practice-only.';
