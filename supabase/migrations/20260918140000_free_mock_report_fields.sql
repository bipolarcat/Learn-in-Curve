-- Free-mock gated report: attempt timing + soft-opt-in marketing basis on leads.

alter table public.leads
  add column if not exists attempt_id uuid,
  add column if not exists course text,
  add column if not exists marketing_basis text,
  add column if not exists duration_ms integer,
  add column if not exists over_time boolean not null default false,
  add column if not exists question_timings jsonb not null default '{}'::jsonb,
  add column if not exists format_breakdown jsonb not null default '[]'::jsonb,
  add column if not exists source_path text;

alter table public.leads
  drop constraint if exists leads_course_ck;

alter table public.leads
  add constraint leads_course_ck
  check (course is null or course in ('pmq', 'pfq', 'pmp'));

create unique index if not exists leads_attempt_id_uidx
  on public.leads (attempt_id)
  where attempt_id is not null;

comment on column public.leads.attempt_id is
  'Client-generated uuid for one free-mock sitting.';
comment on column public.leads.course is
  'pmq | pfq | pmp — short course key for reporting.';
comment on column public.leads.marketing_basis is
  'How marketing permission was recorded (e.g. soft_opt_in).';
comment on column public.leads.duration_ms is
  'Wall-clock duration from Start to Finish.';
comment on column public.leads.over_time is
  'True when the countdown hit zero before finish.';
comment on column public.leads.question_timings is
  'Map of question id → elapsedMs spent on that item.';
comment on column public.leads.format_breakdown is
  'Per format correct/total/lost for the gated report.';
comment on column public.leads.source_path is
  'Path where the email was captured (e.g. /free-mock-exam/apm-pmq).';
