-- Free mock leads: which readiness check the lead came from.
-- Existing rows backfill to apm-pmq (the original free mock).

alter table public.leads
  add column if not exists exam_id text;

update public.leads
set exam_id = 'apm-pmq'
where exam_id is null;

alter table public.leads
  alter column exam_id set default 'apm-pmq';

alter table public.leads
  alter column exam_id set not null;

alter table public.leads
  drop constraint if exists leads_exam_id_ck;

alter table public.leads
  add constraint leads_exam_id_ck
  check (exam_id in ('apm-pmq', 'apm-pfq', 'pmp'));

create index if not exists leads_exam_id_idx on public.leads (exam_id);

comment on column public.leads.exam_id is
  'Free-mock exam that produced this lead: apm-pmq | apm-pfq | pmp.';
