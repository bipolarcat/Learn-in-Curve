-- PFQ in 2 Days course row for entitlements + Stripe metadata.course_id.
-- Id is fixed in src/lib/pfq/constants.ts (PFQ_COURSE_ID). Apply in SQL editor.

insert into public.courses (
  id,
  slug,
  name,
  description,
  price_cents,
  is_free,
  status,
  has_mock_exam,
  pass_mark_percent,
  exam_config
)
values (
  'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d',
  'pfq-in-2-days',
  'PFQ in 2 Days',
  'Everything you need to pass the APM Project Fundamentals Qualification, and nothing you don''t.',
  500,
  false,
  'live',
  true,
  60,
  jsonb_build_object('pfq_pro_price_cents', 500)
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  is_free = excluded.is_free,
  status = excluded.status,
  has_mock_exam = excluded.has_mock_exam,
  pass_mark_percent = excluded.pass_mark_percent,
  exam_config = coalesce(public.courses.exam_config, '{}'::jsonb)
    || excluded.exam_config;

-- Unique slug if a placeholder row existed under a different id.
do $$
begin
  if exists (
    select 1 from public.courses
    where slug = 'pfq-in-2-days'
      and id <> 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d'
  ) then
    delete from public.courses
    where slug = 'pfq-in-2-days'
      and id <> 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d';
  end if;
exception when others then
  raise notice 'PFQ course slug cleanup skipped: %', sqlerrm;
end $$;

comment on table public.courses is
  'Course catalogue. PFQ id f8a2c1e0-… is PFQ_COURSE_ID in src/lib/pfq/constants.ts.';
