-- Bug 1: every signup returned 500.
-- notify_admin_new_user() called net.http_post(body := payload::text), but
-- pg_net's signature is net.http_post(url text, body jsonb, params jsonb,
-- headers jsonb, timeout_milliseconds int). No function matched (SQLSTATE
-- 42883), which aborted the INSERT transaction on auth.users. GoTrue returned
-- 500 on /signup for BOTH email sign-up and first-time Google sign-in.
--
-- Two fixes: pass jsonb, and make the notification non-fatal. An admin
-- courtesy email must never be able to take down account creation.
-- NOTE: this secret must match ADMIN_WEBHOOK_SECRET in Railway, which is what
-- src/app/api/admin/new-user/route.ts compares against. If they diverge the
-- endpoint returns 401 and new-user notifications fail silently (the exception
-- block below deliberately swallows it so signup still succeeds). Hardcoding it
-- here is a known wart — move to Supabase Vault before real user volume.
create or replace function public.notify_admin_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  webhook_secret text := 'lic-webhook-2026';
  payload jsonb;
begin
  payload := jsonb_build_object(
    'record', jsonb_build_object(
      'email', new.email,
      'created_at', new.created_at,
      'app_metadata', new.raw_app_meta_data,
      'raw_user_meta_data', new.raw_user_meta_data
    )
  );

  begin
    perform net.http_post(
      -- www, not apex: https://learnincurve.com/<path> does not preserve the
      -- path through the apex->www redirect and 404s. See src/lib/site-url.ts.
      url := 'https://www.learnincurve.com/api/admin/new-user',
      body := payload,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', webhook_secret
      )
    );
  exception when others then
    raise warning 'notify_admin_new_user failed for %: %', new.email, sqlerrm;
  end;

  return new;
end;
$function$;

-- Bug 2: deleting a user returned 500 and showed an empty "()" error in the UI.
-- Every table referencing auth.users cascades on delete except this one, which
-- was NO ACTION, so the FK blocked the delete.
alter table public.feature_entitlements
  drop constraint feature_entitlements_user_id_fkey;

alter table public.feature_entitlements
  add constraint feature_entitlements_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
