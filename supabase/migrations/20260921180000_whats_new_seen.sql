-- What's New seen-state on profiles (nav chips + dashboard banner).
-- Unapplied until Sim runs it — do not treat this file as live.

alter table public.profiles
  add column if not exists whats_new_seen_at timestamptz not null default now();

-- Existing accounts should see the first announcement; new signups should not
-- (default now() means anyone created after this migration starts caught up).
update public.profiles
   set whats_new_seen_at = timestamptz '2026-09-01 00:00:00+00'
 where created_at < now();
