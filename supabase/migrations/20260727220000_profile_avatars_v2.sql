-- Swap profile avatars to the illustrated cast (wolf/rabbit/cat/dog/bear).
-- Source 7.png was a duplicate wolf (briefly labeled "fox"); not included.

alter table public.profiles
  drop constraint if exists profiles_avatar_id_check;

-- Remap legacy animal ids before tightening the check.
update public.profiles set avatar_id = 'rabbit' where avatar_id = 'owl';
update public.profiles set avatar_id = 'bear' where avatar_id = 'badger';
update public.profiles set avatar_id = 'dog' where avatar_id = 'otter';
update public.profiles set avatar_id = 'cat' where avatar_id = 'hedgehog';
update public.profiles set avatar_id = 'wolf'
  where avatar_id is null
     or avatar_id not in ('wolf', 'rabbit', 'cat', 'dog', 'bear');

alter table public.profiles
  alter column avatar_id set default 'wolf';

alter table public.profiles
  add constraint profiles_avatar_id_check
  check (avatar_id in ('wolf', 'rabbit', 'cat', 'dog', 'bear'));
