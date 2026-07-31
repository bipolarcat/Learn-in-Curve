-- Premium bundle unlock: £9.99 (was £5.00 / 500 cents).
UPDATE courses
SET exam_config =
  coalesce(exam_config, '{}'::jsonb)
  || jsonb_build_object('ai_tutor_price_cents', 999)
WHERE slug = 'pmq-in-5-days';
