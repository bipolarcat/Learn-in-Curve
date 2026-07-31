-- Multi-list email signups (LIC — 2026-07-30).
--
-- PROBLEM THIS FIXES
-- `newsletter_subscribers` is UNIQUE on `email` and carries a single `course`
-- column. /api/notify caught the 23505 duplicate and PATCHED `course`, so a
-- person joining a second list silently overwrote their first membership:
-- a PFQ waitlist signup who later asked about the AI Pro Bundle stopped being
-- a PFQ signup. Membership becomes rows here, one per (email, list_key).
--
-- CONSENT MODEL
-- `newsletter_subscribers` stays the PERSON record: one row per email, holding
-- marketing_consent + the global unsubscribe_token. `waitlist_signups` holds
-- MEMBERSHIP. Asking to hear about a launch and agreeing to marketing are
-- separate permissions under UK GDPR/PECR and must be separately withdrawable,
-- so ticking marketing adds a second row (list_key = 'newsletter') rather than
-- mutating the launch row.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- Matches a `key` in src/lib/notify/lists.ts. Text, not an enum: adding a
  -- list should be a code change, not a schema migration + deploy ordering
  -- problem. The API validates against the registry before inserting.
  list_key text not null,
  created_at timestamptz not null default now(),
  confirmation_sent_at timestamptz,
  unsubscribed_at timestamptz,
  constraint waitlist_signups_email_list_key_unique unique (email, list_key)
);

comment on table public.waitlist_signups is
  'One row per (email, list). Defined in src/lib/notify/lists.ts. See 20260730160000_waitlist_signups.sql for why this replaced newsletter_subscribers.course.';

-- Membership lookups are always "who is on list X" (export) or "is this email
-- already on list X" (signup). The unique constraint already indexes
-- (email, list_key); this covers the list-first direction.
create index if not exists waitlist_signups_list_key_idx
  on public.waitlist_signups (list_key, created_at desc);

-- BACKFILL — carry every existing membership across before anything reads it.
-- `course` was the old single-membership column; null meant the general
-- newsletter signup on the homepage band.
insert into public.waitlist_signups (email, list_key, created_at, confirmation_sent_at)
select
  ns.email,
  coalesce(nullif(trim(ns.course), ''), 'newsletter'),
  coalesce(ns.subscribed_at, now()),
  ns.confirmation_sent_at
from public.newsletter_subscribers ns
on conflict (email, list_key) do nothing;

-- Anyone who ticked marketing also belongs on the newsletter list, whichever
-- form they came in through.
insert into public.waitlist_signups (email, list_key, created_at)
select ns.email, 'newsletter', coalesce(ns.marketing_consent_at, ns.subscribed_at, now())
from public.newsletter_subscribers ns
where ns.marketing_consent is true
on conflict (email, list_key) do nothing;

-- RLS: this is personal data with no legitimate client-side read. /api/notify
-- uses the service role, which bypasses RLS. Enabling with no permissive policy
-- means anon and authenticated clients get nothing — deny by default.
alter table public.waitlist_signups enable row level security;

revoke all on public.waitlist_signups from anon, authenticated;
