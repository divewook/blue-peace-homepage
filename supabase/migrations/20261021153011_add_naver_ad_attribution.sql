-- Existing traffic_* columns continue to represent the first touch.
-- New visits in the same browser session are retained separately.
alter table public.customers
  add column if not exists naver_keyword text,
  add column if not exists naver_query text,
  add column if not exists naver_ad_group text,
  add column if not exists naver_ad text,
  add column if not exists attribution_latest jsonb;
