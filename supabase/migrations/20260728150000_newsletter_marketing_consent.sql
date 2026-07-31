-- Marketing consent + course interest for waitlist / notify flows.
-- Apply in Supabase SQL editor when convenient (API already writes these
-- columns when present; Storage sidecar records consent until then).

alter table public.newsletter_subscribers
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists course_interest text;

comment on column public.newsletter_subscribers.marketing_consent is
  'True when the user explicitly opted in to PM / AI newsletters and marketing email.';

comment on column public.newsletter_subscribers.course_interest is
  'Optional course slug the signup came from (e.g. pfq-in-2-days).';
