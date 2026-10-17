alter table public.customers
  add column if not exists schedule_mode text not null default 'exact',
  add column if not exists schedule_alternatives jsonb not null default '[]'::jsonb,
  add column if not exists request_key uuid,
  add column if not exists request_status text not null default 'matched',
  add column if not exists privacy_consent_version text,
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists marketing_consent boolean not null default false;

update public.customers
set request_status = case
  when matched_instructor_id is null then 'pending_assignment'
  else 'matched'
end
where request_status not in ('pending_assignment', 'matched');

alter table public.customers
  drop constraint if exists customers_schedule_mode_check,
  add constraint customers_schedule_mode_check
    check (schedule_mode in ('exact', 'flexible')),
  drop constraint if exists customers_request_status_check,
  add constraint customers_request_status_check
    check (request_status in ('pending_assignment', 'matched')),
  drop constraint if exists customers_schedule_alternatives_array_check,
  add constraint customers_schedule_alternatives_array_check
    check (jsonb_typeof(schedule_alternatives) = 'array');

create unique index if not exists customers_request_key_unique_idx
  on public.customers (request_key)
  where request_key is not null;

create index if not exists customers_request_status_created_at_idx
  on public.customers (request_status, created_at desc);
