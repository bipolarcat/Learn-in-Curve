-- v2 content rebuild: isolated tables for the BoK 8th ed / PMQ 2024 handbook rewrite.
--
-- Purely additive. Does not read, alter, or drop `sections`, `lessons`, `courses`
-- or `questions`. v1 continues serving learners untouched until cutover.
--
-- Naming note: `_v2` is an internal build-time namespace only. It is never surfaced
-- to learners anywhere in the UI.

create table if not exists public.sections_v2 (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses (id) on delete cascade,
  order_index   integer not null,
  title         text not null,
  lo_code       text,
  day           integer,
  theme         text,
  -- provenance / build metadata
  content_version text not null default 'v2',
  source_ref    text,          -- e.g. 'BoK 8e s1.2; PMQ Handbook 2024 LO1'
  authored_on   date,
  reviewed_on   date,
  review_status text not null default 'draft'
                check (review_status in ('draft','in_review','approved')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (course_id, order_index)
);

create table if not exists public.lessons_v2 (
  id            uuid primary key default gen_random_uuid(),
  section_id    uuid not null references public.sections_v2 (id) on delete cascade,
  order_index   integer not null,
  lesson_type   text not null,
  title         text not null,
  body          jsonb not null,
  content_version text not null default 'v2',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (section_id, order_index)
);

create index if not exists sections_v2_course_order_idx
  on public.sections_v2 (course_id, order_index);
create index if not exists lessons_v2_section_order_idx
  on public.lessons_v2 (section_id, order_index);

comment on table public.sections_v2 is
  'v2 content rebuild (BoK 8th ed / PMQ 2024 handbook). Isolated from live `sections` until cutover. Source of truth is content/v2/*.json in the repo; these rows are a build artifact.';
comment on table public.lessons_v2 is
  'v2 lesson bodies. Source of truth is content/v2/*.json in the repo; these rows are a build artifact. Do not hand-edit.';
comment on column public.sections_v2.review_status is
  'draft -> in_review -> approved. Cutover requires all 24 sections at approved.';

-- RLS: mirror v1 posture (public read of course content, writes via service role only).
alter table public.sections_v2 enable row level security;
alter table public.lessons_v2  enable row level security;

drop policy if exists "sections_v2 readable" on public.sections_v2;
create policy "sections_v2 readable"
  on public.sections_v2 for select
  using (true);

drop policy if exists "lessons_v2 readable" on public.lessons_v2;
create policy "lessons_v2 readable"
  on public.lessons_v2 for select
  using (true);
