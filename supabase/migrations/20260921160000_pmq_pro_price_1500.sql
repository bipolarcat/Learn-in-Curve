-- PMQ Pro Bundle repricing: £8.00 → £15.00 (2026-09-21).
-- Checkout charges SLY_UNLOCK_PRICE_CENTS from the registry and never reads
-- exam_config.ai_tutor_price_cents, but the column still held 999 from the
-- £9.99 era. Align it with the registry so the DB stops contradicting code.
UPDATE courses
SET exam_config =
  coalesce(exam_config, '{}'::jsonb)
  || jsonb_build_object('ai_tutor_price_cents', 1500)
WHERE slug = 'pmq-in-5-days';
