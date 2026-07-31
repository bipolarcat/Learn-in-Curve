-- LIC-42: persistent AI tutor chat history (see AI_TUTOR_BACKEND_SPEC.md §1, §4)

create table if not exists public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  learning_objective text,
  rating smallint check (rating in (-1, 1)),
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

create index if not exists tutor_messages_user_course_created_idx
  on public.tutor_messages (user_id, course_id, created_at);

alter table public.tutor_messages enable row level security;

create policy "tutor_messages_select_own"
  on public.tutor_messages for select
  using (auth.uid() = user_id);

create policy "tutor_messages_insert_own"
  on public.tutor_messages for insert
  with check (auth.uid() = user_id);

create policy "tutor_messages_update_own"
  on public.tutor_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
