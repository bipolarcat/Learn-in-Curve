-- Every auth.users row should have a public.profiles row.
--
-- Until now profiles rows were created lazily, only when someone saved a name,
-- avatar or theme. On 2026-09-21 that meant 14 profile rows for 43 users, so
-- any per-user state stored on profiles (starting with whats_new_seen_at)
-- silently missed two thirds of the user base.
--
-- Two parts: backfill the missing rows, then a trigger so it cannot recur.

-- 1. Backfill. Every other column has a default or is nullable.
--    whats_new_seen_at is set to the same 2026-09-01 marker the What's New
--    migration used, so these users see the first announcement like everyone
--    else rather than starting silently caught up.
insert into public.profiles (user_id, whats_new_seen_at)
select u.id, timestamptz '2026-09-01 00:00:00+00'
  from auth.users u
 where not exists (
   select 1 from public.profiles p where p.user_id = u.id
 );

-- 2. Trigger, so every future signup gets a row automatically.
--
--    IMPORTANT, learned the hard way (see 20260804180000): a trigger on
--    auth.users that raises will abort the INSERT and GoTrue returns 500 on
--    /signup, killing both email sign-up and first-time Google sign-in. So this
--    function can never be allowed to fail the transaction: the insert is
--    ON CONFLICT DO NOTHING and the whole body is wrapped in an exception
--    handler that downgrades any error to a warning. A missing profile row is a
--    recoverable annoyance; a broken signup is not.
--
--    New rows take the whats_new_seen_at default of now(), which is correct:
--    someone joining today has not missed anything and should not be shown a
--    "what's new" banner for features that were already there when they arrived.
create or replace function public.ensure_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  begin
    insert into public.profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  exception when others then
    raise warning 'ensure_profile_for_new_user failed for %: %', new.id, sqlerrm;
  end;

  return new;
end;
$function$;

drop trigger if exists on_auth_user_created_ensure_profile on auth.users;

create trigger on_auth_user_created_ensure_profile
  after insert on auth.users
  for each row
  execute function public.ensure_profile_for_new_user();
