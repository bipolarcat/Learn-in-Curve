-- PFQ lesson sections for section_progress checkpoints.
-- Written 2026-08-13. Apply after 20260813200000_pfq_course.sql (course row).
-- Not applied by Cursor this session — write-only unless Sim applies it.

-- Ensure course row exists (idempotent with commerce migration).
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
  price_cents = excluded.price_cents,
  status = excluded.status;

insert into public.sections (id, course_id, order_index, title, lo_code, day, theme)
values
  ('f8a2c1e0-4d3b-4a9e-9c01-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 1, 'Project management and the operating environment', 'PFQ-OBJ-01', 1, 'Day 1'),
  ('f8a2c1e0-4d3b-4a9e-9c02-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 2, 'Project life cycles', 'PFQ-OBJ-02', 1, 'Day 1'),
  ('f8a2c1e0-4d3b-4a9e-9c03-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 3, 'Roles and responsibilities', 'PFQ-OBJ-03', 1, 'Day 1'),
  ('f8a2c1e0-4d3b-4a9e-9c04-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 4, 'Project management planning', 'PFQ-OBJ-04', 1, 'Day 1'),
  ('f8a2c1e0-4d3b-4a9e-9c05-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 5, 'Project scope management', 'PFQ-OBJ-05', 1, 'Day 1'),
  ('f8a2c1e0-4d3b-4a9e-9c06-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 6, 'Resource, scheduling and optimisation', 'PFQ-OBJ-06', 2, 'Day 2'),
  ('f8a2c1e0-4d3b-4a9e-9c07-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 7, 'Project risk and issue management', 'PFQ-OBJ-07', 2, 'Day 2'),
  ('f8a2c1e0-4d3b-4a9e-9c08-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 8, 'Quality', 'PFQ-OBJ-08', 2, 'Day 2'),
  ('f8a2c1e0-4d3b-4a9e-9c09-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 9, 'Communication', 'PFQ-OBJ-09', 2, 'Day 2'),
  ('f8a2c1e0-4d3b-4a9e-9c0a-2e1d0b9a8c7d', 'f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d', 10, 'Leadership and teamwork', 'PFQ-OBJ-10', 2, 'Day 2')
on conflict (id) do update set
  title = excluded.title,
  lo_code = excluded.lo_code,
  day = excluded.day,
  theme = excluded.theme,
  order_index = excluded.order_index,
  course_id = excluded.course_id;

comment on table public.sections is
  'Course sections. PFQ objectives use fixed ids f8a2c1e0-…-9c0N-… matching src/lib/pfq/section-ids.ts.';
