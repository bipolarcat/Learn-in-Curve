-- Per-account dark-mode preference (LIC-114).
--
-- Dark mode used to live in localStorage and fall back to the device's
-- prefers-color-scheme, which is why a first sign-in on a machine with OS dark
-- mode opened the dashboard dark having never been asked (LIC-107). The
-- preference is now an explicit, opt-in, per-ACCOUNT value: it has to survive
-- logout, re-login and a change of device, which localStorage cannot do.
--
-- Default is 'light' so a brand-new user is never dark until they toggle.
--
-- NOTE: `public.sections.theme` already exists and is completely unrelated —
-- it holds APM syllabus themes ('Planning', 'People', 'Delivery', …) for course
-- content. Nothing to do with light/dark. Do not read or write it for theming.
alter table public.profiles
  add column if not exists theme_preference text not null default 'light';

alter table public.profiles
  drop constraint if exists profiles_theme_preference_check;

alter table public.profiles
  add constraint profiles_theme_preference_check
  check (theme_preference in ('light', 'dark'));

comment on column public.profiles.theme_preference is
  'User dark-mode opt-in: light | dark. Never inferred from the OS. Applies only on the dashboard and LO pages; public pages are always light.';
