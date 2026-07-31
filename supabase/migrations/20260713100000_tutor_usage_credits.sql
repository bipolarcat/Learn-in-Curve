-- Sly fair-usage credits ledger: unlock grants £5; top-ups credit 70% of payment.

create table if not exists public.tutor_usage_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  credit_gbp_cents integer not null check (credit_gbp_cents > 0),
  gross_gbp_cents integer not null check (gross_gbp_cents > 0),
  source text not null check (source in ('unlock', 'topup')),
  stripe_payment_id text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists tutor_usage_credits_stripe_payment_uidx
  on public.tutor_usage_credits (stripe_payment_id);

create index if not exists tutor_usage_credits_user_course_idx
  on public.tutor_usage_credits (user_id, course_id);

alter table public.tutor_usage_credits enable row level security;

create policy "tutor_usage_credits_select_own"
  on public.tutor_usage_credits for select
  using (auth.uid() = user_id);

-- Inserts only via service role (Stripe webhook); no insert policy for authenticated users.
