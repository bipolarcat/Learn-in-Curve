-- Homepage guest Sly trial: 3 live messages per IP (hashed), no chat text stored.

create table if not exists public.guest_tutor_usage (
  ip_hash text primary key,
  message_count integer not null default 0
    check (message_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.guest_tutor_usage enable row level security;
-- No client policies: only the service-role client (via claim function) may touch this.

create or replace function public.claim_guest_tutor_message(
  p_ip_hash text,
  p_cap integer
)
returns table(allowed boolean, message_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_cap is null or p_cap < 1 then
    raise exception 'p_cap must be >= 1';
  end if;

  insert into public.guest_tutor_usage (ip_hash, message_count, updated_at)
  values (p_ip_hash, 1, now())
  on conflict (ip_hash) do update
    set message_count = guest_tutor_usage.message_count + 1,
        updated_at = now()
    where guest_tutor_usage.message_count < p_cap
  returning guest_tutor_usage.message_count into v_count;

  if v_count is null then
    select gu.message_count into v_count
    from public.guest_tutor_usage gu
    where gu.ip_hash = p_ip_hash;

    return query select false, coalesce(v_count, p_cap);
  end if;

  return query select true, v_count;
end;
$$;

revoke all on function public.claim_guest_tutor_message(text, integer) from public;
grant execute on function public.claim_guest_tutor_message(text, integer) to service_role;
