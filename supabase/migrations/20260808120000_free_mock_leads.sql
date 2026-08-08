-- Free mock exam lead magnet (Growth Pass 1).
-- Email + score + optional marketing consent. No auth.users coupling.
-- Inserts go through the service-role server action only (no public INSERT policy).

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  score integer not null check (score >= 0),
  max_score integer not null default 15 check (max_score > 0),
  weakest_los text[] not null default '{}',
  lo_breakdown jsonb not null default '[]'::jsonb,
  marketing_consent boolean not null default false,
  consent_timestamp timestamptz,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer_category text,
  source text not null default 'free_mock_exam',
  created_at timestamptz not null default now(),
  constraint leads_consent_timestamp_ck check (
    (marketing_consent = false and consent_timestamp is null)
    or (marketing_consent = true and consent_timestamp is not null)
  )
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_source_idx on public.leads (source);

alter table public.leads enable row level security;

-- No SELECT / INSERT / UPDATE / DELETE for anon or authenticated.
-- Service role bypasses RLS for the submitFreeMockLead server action.

comment on table public.leads is
  'Lead magnet captures (free mock exam). Marketing consent is separate from email-for-results.';
