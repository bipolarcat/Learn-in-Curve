-- Three-tier entitlements (LIC-98 — 2026-07-30).
--
-- BEFORE: one feature value, 'ai_tutor', which unlocked video, audio, mocks 2-4,
-- Sly AND the end-of-course report together. The pricing page advertises three
-- tiers, so that single boolean made the tier split marketing copy rather than
-- product behaviour — a Pro purchase silently granted everything AI Pro promises.
--
-- AFTER: `feature` holds the purchased tier.
--   'pro'    → Pro Bundle (£8): quiz sets 2-5, mocks 2-3, video, audio. No Sly.
--   'ai_pro' → AI Pro Bundle (not on sale yet): everything in Pro, plus quiz
--              sets 6-8, mock 4, Sly, and the end-of-course report.
-- Starter is the absence of a row — never stored, so a free user can't be
-- half-provisioned by a failed write.
--
-- The single pre-existing 'ai_tutor' row is Sim's own test account (confirmed
-- 2026-07-30: no customer has ever paid). It maps to 'ai_pro' so testing keeps
-- access to every feature. Had there been real £9.99 buyers they would also map
-- to 'ai_pro' — they paid for the full bundle, and downgrading a paying customer
-- to match a newer, cheaper tier would be both a trust and a contract problem.

alter table public.feature_entitlements
  drop constraint if exists feature_entitlements_feature_check;

-- Widen first so the update below is legal, then narrow to the final set.
alter table public.feature_entitlements
  add constraint feature_entitlements_feature_check
  check (feature in ('ai_tutor', 'pro', 'ai_pro'));

update public.feature_entitlements
set feature = 'ai_pro'
where feature = 'ai_tutor';

alter table public.feature_entitlements
  drop constraint feature_entitlements_feature_check;

alter table public.feature_entitlements
  add constraint feature_entitlements_feature_check
  check (feature in ('pro', 'ai_pro'));

comment on column public.feature_entitlements.feature is
  'Purchased tier: pro | ai_pro. Starter = no row. Tier rules live in src/lib/pmq/tiers.ts.';
