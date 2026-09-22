-- PMQ recall activity persistence (Pair up / Lineup / Group up).
-- LIC-150. Additive only. Apply on a DEV database first — never against
-- production from a local agent session (.env.local is the live project).

-- ── Tables ───────────────────────────────────────────────────────────

create table if not exists public.activity_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid,
  lo_number int,
  activity_id text not null,
  activity_type text not null
    check (activity_type in ('pairup', 'lineup', 'groupup')),
  heading text,
  content_hash text not null,
  attempt_number int not null,
  input_mode text check (input_mode in ('drag', 'tap')),
  device text check (device in ('mobile', 'desktop')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  outcome text check (outcome in ('completed', 'abandoned')),
  wrong_turns int not null default 0,
  moves int not null default 0,
  ms_to_first_wrong int,
  duration_ms int
);

create index if not exists activity_attempts_user_activity_idx
  on public.activity_attempts (user_id, activity_id);

create index if not exists activity_attempts_activity_idx
  on public.activity_attempts (activity_id);

comment on table public.activity_attempts is
  'One row per recall-activity modal open (Pair up / Lineup / Group up).';

create table if not exists public.activity_wrong_turns (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null
    references public.activity_attempts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_id text not null,
  activity_type text not null
    check (activity_type in ('pairup', 'lineup', 'groupup')),
  turn_index int not null,
  ms_since_start int,
  item text,
  chosen text,
  expected text,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_wrong_turns_user_activity_idx
  on public.activity_wrong_turns (user_id, activity_id);

create index if not exists activity_wrong_turns_activity_idx
  on public.activity_wrong_turns (activity_id);

create index if not exists activity_wrong_turns_attempt_idx
  on public.activity_wrong_turns (attempt_id);

comment on table public.activity_wrong_turns is
  'One row per wrong turn inside a recall activity attempt.';

create table if not exists public.activity_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_id text not null,
  total_wrong_turns int not null default 0,
  attempts int not null default 0,
  completions int not null default 0,
  first_completed_at timestamptz,
  best_wrong_turns int,
  last_played_at timestamptz,
  primary key (user_id, activity_id)
);

comment on table public.activity_progress is
  'Lifetime totals per user × activity — UI counter source of truth.';

-- ── RLS: SELECT own rows only; no direct client writes ───────────────

alter table public.activity_attempts enable row level security;
alter table public.activity_wrong_turns enable row level security;
alter table public.activity_progress enable row level security;

revoke all on public.activity_attempts from anon, authenticated;
revoke all on public.activity_wrong_turns from anon, authenticated;
revoke all on public.activity_progress from anon, authenticated;

grant select on public.activity_attempts to authenticated;
grant select on public.activity_wrong_turns to authenticated;
grant select on public.activity_progress to authenticated;

drop policy if exists activity_attempts_select_own on public.activity_attempts;
create policy activity_attempts_select_own
  on public.activity_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists activity_wrong_turns_select_own on public.activity_wrong_turns;
create policy activity_wrong_turns_select_own
  on public.activity_wrong_turns
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists activity_progress_select_own on public.activity_progress;
create policy activity_progress_select_own
  on public.activity_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ── RPCs (auth.uid() only — never take user_id as an argument) ───────

create or replace function public.start_activity_attempt(
  p_activity_id text,
  p_activity_type text,
  p_course_id uuid,
  p_lo_number int,
  p_heading text,
  p_content_hash text,
  p_input_mode text,
  p_device text
)
returns table(attempt_id uuid, total_wrong_turns int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_attempt_number int;
  v_total int;
  v_attempt_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_activity_type is null
     or p_activity_type not in ('pairup', 'lineup', 'groupup') then
    raise exception 'invalid activity_type';
  end if;
  if p_activity_id is null or length(trim(p_activity_id)) = 0 then
    raise exception 'activity_id required';
  end if;
  if p_content_hash is null or length(trim(p_content_hash)) = 0 then
    raise exception 'content_hash required';
  end if;
  if p_input_mode is not null and p_input_mode not in ('drag', 'tap') then
    raise exception 'invalid input_mode';
  end if;
  if p_device is not null and p_device not in ('mobile', 'desktop') then
    raise exception 'invalid device';
  end if;

  insert into public.activity_progress as ap (
    user_id,
    activity_id,
    attempts,
    last_played_at
  )
  values (v_uid, p_activity_id, 1, now())
  on conflict (user_id, activity_id) do update
    set attempts = ap.attempts + 1,
        last_played_at = now()
  returning ap.attempts, ap.total_wrong_turns
  into v_attempt_number, v_total;

  insert into public.activity_attempts (
    user_id,
    course_id,
    lo_number,
    activity_id,
    activity_type,
    heading,
    content_hash,
    attempt_number,
    input_mode,
    device
  )
  values (
    v_uid,
    p_course_id,
    p_lo_number,
    p_activity_id,
    p_activity_type,
    p_heading,
    p_content_hash,
    v_attempt_number,
    p_input_mode,
    p_device
  )
  returning id into v_attempt_id;

  attempt_id := v_attempt_id;
  total_wrong_turns := coalesce(v_total, 0);
  return next;
end;
$$;

create or replace function public.record_activity_wrong_turn(
  p_attempt_id uuid,
  p_item text,
  p_chosen text,
  p_expected text,
  p_detail jsonb,
  p_ms_since_start int
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_attempt public.activity_attempts%rowtype;
  v_new_wrong int;
  v_total int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_attempt_id is null then
    raise exception 'attempt_id required';
  end if;

  select * into v_attempt
  from public.activity_attempts
  where id = p_attempt_id
  for update;

  if not found or v_attempt.user_id is distinct from v_uid then
    raise exception 'attempt not found';
  end if;
  if v_attempt.ended_at is not null then
    raise exception 'attempt already ended';
  end if;

  v_new_wrong := v_attempt.wrong_turns + 1;

  insert into public.activity_wrong_turns (
    attempt_id,
    user_id,
    activity_id,
    activity_type,
    turn_index,
    ms_since_start,
    item,
    chosen,
    expected,
    detail
  )
  values (
    p_attempt_id,
    v_uid,
    v_attempt.activity_id,
    v_attempt.activity_type,
    v_new_wrong,
    p_ms_since_start,
    p_item,
    p_chosen,
    p_expected,
    p_detail
  );

  update public.activity_attempts
  set
    wrong_turns = v_new_wrong,
    ms_to_first_wrong = coalesce(ms_to_first_wrong, p_ms_since_start)
  where id = p_attempt_id;

  update public.activity_progress
  set
    total_wrong_turns = total_wrong_turns + 1,
    last_played_at = now()
  where user_id = v_uid
    and activity_id = v_attempt.activity_id
  returning total_wrong_turns into v_total;

  return coalesce(v_total, v_new_wrong);
end;
$$;

create or replace function public.finish_activity_attempt(
  p_attempt_id uuid,
  p_outcome text,
  p_moves int,
  p_duration_ms int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_attempt public.activity_attempts%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_attempt_id is null then
    raise exception 'attempt_id required';
  end if;
  if p_outcome is null or p_outcome not in ('completed', 'abandoned') then
    raise exception 'invalid outcome';
  end if;

  select * into v_attempt
  from public.activity_attempts
  where id = p_attempt_id
  for update;

  if not found or v_attempt.user_id is distinct from v_uid then
    raise exception 'attempt not found';
  end if;

  -- Idempotent: finishing an already-finished attempt is a no-op.
  if v_attempt.ended_at is not null then
    return;
  end if;

  update public.activity_attempts
  set
    ended_at = now(),
    outcome = p_outcome,
    moves = coalesce(p_moves, 0),
    duration_ms = p_duration_ms
  where id = p_attempt_id;

  if p_outcome = 'completed' then
    update public.activity_progress
    set
      completions = completions + 1,
      first_completed_at = coalesce(first_completed_at, now()),
      best_wrong_turns = least(
        coalesce(best_wrong_turns, v_attempt.wrong_turns),
        v_attempt.wrong_turns
      ),
      last_played_at = now()
    where user_id = v_uid
      and activity_id = v_attempt.activity_id;
  else
    update public.activity_progress
    set last_played_at = now()
    where user_id = v_uid
      and activity_id = v_attempt.activity_id;
  end if;
end;
$$;

revoke all on function public.start_activity_attempt(
  text, text, uuid, int, text, text, text, text
) from public;
revoke all on function public.record_activity_wrong_turn(
  uuid, text, text, text, jsonb, int
) from public;
revoke all on function public.finish_activity_attempt(
  uuid, text, int, int
) from public;

grant execute on function public.start_activity_attempt(
  text, text, uuid, int, text, text, text, text
) to authenticated;
grant execute on function public.record_activity_wrong_turn(
  uuid, text, text, text, jsonb, int
) to authenticated;
grant execute on function public.finish_activity_attempt(
  uuid, text, int, int
) to authenticated;

-- Supabase grants execute on public-schema functions to anon by default, and
-- `revoke ... from public` above does not clear that. These functions already
-- raise 'not authenticated' when auth.uid() is null, so this is defence in
-- depth: it keeps them off the anonymous REST surface entirely.
revoke execute on function public.start_activity_attempt(
  text, text, uuid, int, text, text, text, text
) from anon;
revoke execute on function public.record_activity_wrong_turn(
  uuid, text, text, text, jsonb, int
) from anon;
revoke execute on function public.finish_activity_attempt(
  uuid, text, int, int
) from anon;
