alter table public.customers
  add column if not exists preferred_days text[] not null default '{}'::text[],
  add column if not exists preferred_schedule jsonb not null default '{}'::jsonb,
  add column if not exists landing_url text,
  add column if not exists referrer_url text,
  add column if not exists traffic_source text,
  add column if not exists traffic_medium text,
  add column if not exists traffic_campaign text,
  add column if not exists traffic_term text,
  add column if not exists traffic_content text,
  add column if not exists device_type text;

create index if not exists customers_traffic_source_created_at_idx
  on public.customers (traffic_source, created_at desc);
