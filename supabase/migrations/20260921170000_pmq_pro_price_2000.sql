-- PMQ Pro Bundle repricing: £15.00 → £20.00 (2026-09-21, second change same day).
-- Checkout charges SLY_UNLOCK_PRICE_CENTS from the registry and never reads
-- exam_config.ai_tutor_price_cents, but the column is kept aligned so the DB
-- never contradicts the code. Supersedes 20260921160000_pmq_pro_price_1500.sql.
UPDATE courses
SET exam_config =
  coalesce(exam_config, '{}'::jsonb)
  || jsonb_build_object('ai_tutor_price_cents', 2000)
WHERE slug = 'pmq-in-5-days';
