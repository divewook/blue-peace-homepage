alter table public.instructors
  add column if not exists password_hash text;

update public.instructors
set password_hash = extensions.crypt(password, extensions.gen_salt('bf', 12))
where password_hash is null and password is not null;

create table if not exists public.auth_login_attempts (
  identifier_hash text primary key,
  attempts integer not null default 0 check (attempts >= 0),
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.auth_login_attempts enable row level security;
revoke all on public.auth_login_attempts from anon, authenticated;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  recipient_role text not null,
  recipient_hash text,
  provider text not null default 'kakao_alimtalk',
  status text not null check (status in ('sent', 'failed', 'skipped')),
  provider_message_id text,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists notification_deliveries_created_at_idx
  on public.notification_deliveries (created_at desc);

alter table public.notification_deliveries enable row level security;
revoke all on public.notification_deliveries from anon, authenticated;
