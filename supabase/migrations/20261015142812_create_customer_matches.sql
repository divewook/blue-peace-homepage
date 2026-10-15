create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  course text not null,
  pool text not null,
  time_slot text not null,
  matched_instructor_id uuid references public.instructors(id) on delete set null,
  matched_instructor text not null,
  created_at timestamptz not null default now()
);

create index if not exists customers_instructor_created_at_idx
  on public.customers (matched_instructor_id, created_at desc);

alter table public.customers enable row level security;
revoke all on public.customers from anon, authenticated;
