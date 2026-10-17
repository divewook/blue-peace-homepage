alter table public.instructors
  add column if not exists schedule_by_day jsonb,
  add column if not exists schedule_revision integer not null default 0;

alter table public.instructors
  drop constraint if exists instructors_schedule_by_day_object_check,
  add constraint instructors_schedule_by_day_object_check
    check (schedule_by_day is null or jsonb_typeof(schedule_by_day) = 'object');

alter table public.customers
  add column if not exists matched_schedule jsonb;
