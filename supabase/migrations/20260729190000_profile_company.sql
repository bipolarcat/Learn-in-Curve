-- Add employer / company to user profiles (dashboard edit profile).
alter table public.profiles
  add column if not exists company text;
