-- Field limits for public.profiles (2026-07-30).
--
-- The form's maxLength is a UX affordance, not a control: saveUserProfile is a
-- server action and is directly callable, so first_name/last_name/profession/
-- company accepted arbitrarily large text straight into Postgres. Validation now
-- lives in src/lib/profile-limits.ts; these constraints are the backstop that
-- holds even if a future code path forgets to call it.
--
-- Limits are deliberately generous — they exist to stop abuse and layout
-- breakage (first_name renders in site chrome), not to reject unusual real
-- names, job titles or company names.

alter table public.profiles
  drop constraint if exists profiles_first_name_len,
  drop constraint if exists profiles_last_name_len,
  drop constraint if exists profiles_profession_len,
  drop constraint if exists profiles_company_len,
  drop constraint if exists profiles_study_goal_len;

alter table public.profiles
  add constraint profiles_first_name_len check (char_length(first_name) <= 80),
  add constraint profiles_last_name_len  check (char_length(last_name)  <= 80),
  add constraint profiles_profession_len check (char_length(profession) <= 120),
  add constraint profiles_company_len    check (char_length(company)    <= 120),
  add constraint profiles_study_goal_len check (char_length(study_goal) <= 200);

-- Age is NOT constrained here: `profiles_age_check` already enforces
-- 13-120 from an earlier migration. Adding a second identical CHECK would be
-- the same duplicate-source-of-truth problem this project has hit repeatedly —
-- two rules for one fact that can later disagree.
