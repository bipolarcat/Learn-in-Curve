-- Re-add exam deadline for dashboard course card.

alter table public.profiles
  add column if not exists target_exam_date date;
