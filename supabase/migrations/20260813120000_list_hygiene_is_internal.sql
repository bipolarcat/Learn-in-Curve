-- List hygiene: mark founder/test signups so they never enter counts, exports,
-- or marketing sends. Classification is set server-side on insert
-- (`isInternalEmail` in src/lib/email/internal.ts). Never accept this flag
-- from the client.
--
-- No backfill: junk rows were deleted manually on 2026-08-13; remaining rows
-- are genuine.

alter table public.newsletter_subscribers
  add column if not exists is_internal boolean not null default false;

alter table public.waitlist_signups
  add column if not exists is_internal boolean not null default false;

alter table public.leads
  add column if not exists is_internal boolean not null default false;

create index if not exists newsletter_subscribers_public_idx
  on public.newsletter_subscribers (is_internal)
  where is_internal = false;

create index if not exists waitlist_signups_public_idx
  on public.waitlist_signups (is_internal)
  where is_internal = false;

create index if not exists leads_public_idx
  on public.leads (is_internal)
  where is_internal = false;

comment on column public.newsletter_subscribers.is_internal is
  'True for founder/test addresses. Exclude from counts, exports, and marketing sends. Set server-side only.';

comment on column public.waitlist_signups.is_internal is
  'True for founder/test addresses. Exclude from counts, exports, and marketing sends. Set server-side only.';

comment on column public.leads.is_internal is
  'True for founder/test addresses. Exclude from counts, exports, and marketing sends. Set server-side only.';
