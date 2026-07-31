-- Global spend guardrail for the homepage guest Sly trial (Gemini cost).
-- Singleton row (id = 1). This is separate from guest_tutor_usage (per-IP
-- message cap) — this table tracks TOTAL spend across every guest, ever.
--
-- Cap resets ONLY via explicit manual instruction (Sim asking Claude/Cursor
-- to run the SQL at the bottom of this file, or running it directly in the
-- Supabase SQL editor) — there is no automatic daily/monthly reset.
--
-- "enabled" is the kill switch: the guest-chat route checks this before
-- calling Gemini. Flipping it to false takes effect immediately, no deploy
-- needed. It does NOT auto-flip to false when the cap is crossed — crossing
-- the cap only sends an email alert (see sendGuestBudgetAlertEmail in the
-- app) so Sim can decide and flip it manually.

create table if not exists public.guest_tutor_budget (
  id integer primary key default 1 check (id = 1),
  total_gbp_cents integer not null default 0 check (total_gbp_cents >= 0),
  cap_gbp_cents integer not null default 300 check (cap_gbp_cents > 0),
  notified boolean not null default false,
  enabled boolean not null default true,
  last_reset_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.guest_tutor_budget (id, cap_gbp_cents)
values (1, 300)
on conflict (id) do nothing;

alter table public.guest_tutor_budget enable row level security;
-- No client policies: only the service-role client (via the function below,
-- or direct admin SQL) may touch this.

create or replace function public.record_guest_tutor_spend(p_delta_gbp_cents integer)
returns table(
  total_gbp_cents integer,
  cap_gbp_cents integer,
  just_crossed boolean,
  enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before integer;
  v_after integer;
  v_cap integer;
  v_notified boolean;
  v_enabled boolean;
  v_just_crossed boolean;
begin
  select gb.total_gbp_cents, gb.cap_gbp_cents, gb.notified, gb.enabled
    into v_before, v_cap, v_notified, v_enabled
    from public.guest_tutor_budget gb
   where gb.id = 1
   for update;

  v_after := v_before + greatest(coalesce(p_delta_gbp_cents, 0), 0);
  v_just_crossed := (v_before < v_cap and v_after >= v_cap and not v_notified);

  update public.guest_tutor_budget
     set total_gbp_cents = v_after,
         updated_at = now(),
         notified = notified or v_just_crossed
   where id = 1;

  return query select v_after, v_cap, v_just_crossed, v_enabled;
end;
$$;

revoke all on function public.record_guest_tutor_spend(integer) from public;
grant execute on function public.record_guest_tutor_spend(integer) to service_role;

-- ---------------------------------------------------------------------
-- Manual ops (run in Supabase SQL editor, or ask Claude to run via MCP):
--
--   Reset the counter to zero (e.g. after investigating a cap-crossing):
--     update public.guest_tutor_budget
--        set total_gbp_cents = 0, notified = false, last_reset_at = now()
--      where id = 1;
--
--   Kill switch — disable guest trial immediately, no deploy needed:
--     update public.guest_tutor_budget set enabled = false where id = 1;
--
--   Re-enable:
--     update public.guest_tutor_budget set enabled = true where id = 1;
--
--   Change the cap (default £3.00 = 300 pence):
--     update public.guest_tutor_budget set cap_gbp_cents = 500 where id = 1;
-- ---------------------------------------------------------------------
