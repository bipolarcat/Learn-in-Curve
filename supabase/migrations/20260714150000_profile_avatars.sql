-- Profile avatars (4 animal options) + drop unused study schedule fields.

alter table public.profiles
  drop column if exists target_exam_date;

alter table public.profiles
  drop column if exists weekly_study_hours;

alter table public.profiles
  add column if not exists avatar_id text not null default 'owl';

alter table public.profiles
  drop constraint if exists profiles_avatar_id_check;

alter table public.profiles
  add constraint profiles_avatar_id_check
  check (avatar_id in ('owl', 'badger', 'otter', 'hedgehog'));
