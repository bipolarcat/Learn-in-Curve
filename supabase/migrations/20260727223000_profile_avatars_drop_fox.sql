-- Drop duplicate wolf option that was labeled "fox" (source 7.png).
alter table public.profiles
  drop constraint if exists profiles_avatar_id_check;

update public.profiles set avatar_id = 'wolf' where avatar_id = 'fox';

alter table public.profiles
  add constraint profiles_avatar_id_check
  check (avatar_id in ('wolf', 'rabbit', 'cat', 'dog', 'bear'));
