alter table public.instructors
  add column if not exists passnine_day_mon boolean not null default false,
  add column if not exists passnine_day_tue boolean not null default false,
  add column if not exists passnine_day_wed boolean not null default false,
  add column if not exists passnine_day_thu boolean not null default false,
  add column if not exists passnine_day_fri boolean not null default false,
  add column if not exists passnine_day_sat boolean not null default false,
  add column if not exists passnine_day_sun boolean not null default false,
  add column if not exists passnine_day_holiday boolean not null default false,
  add column if not exists miryang_day_mon boolean not null default false,
  add column if not exists miryang_day_tue boolean not null default false,
  add column if not exists miryang_day_wed boolean not null default false,
  add column if not exists miryang_day_thu boolean not null default false,
  add column if not exists miryang_day_fri boolean not null default false,
  add column if not exists miryang_day_sat boolean not null default false,
  add column if not exists miryang_day_sun boolean not null default false,
  add column if not exists miryang_day_holiday boolean not null default false;

update public.instructors set
  passnine_day_mon = coalesce(can_passnine, false) and coalesce(available_mon, false),
  passnine_day_tue = coalesce(can_passnine, false) and coalesce(available_tue, false),
  passnine_day_wed = coalesce(can_passnine, false) and coalesce(available_wed, false),
  passnine_day_thu = coalesce(can_passnine, false) and coalesce(available_thu, false),
  passnine_day_fri = coalesce(can_passnine, false) and coalesce(available_fri, false),
  passnine_day_sat = coalesce(can_passnine, false) and coalesce(available_sat, false),
  passnine_day_sun = coalesce(can_passnine, false) and coalesce(available_sun, false),
  miryang_day_mon = coalesce(can_miryang, false) and coalesce(available_mon, false),
  miryang_day_tue = coalesce(can_miryang, false) and coalesce(available_tue, false),
  miryang_day_wed = coalesce(can_miryang, false) and coalesce(available_wed, false),
  miryang_day_thu = coalesce(can_miryang, false) and coalesce(available_thu, false),
  miryang_day_fri = coalesce(can_miryang, false) and coalesce(available_fri, false),
  miryang_day_sat = coalesce(can_miryang, false) and coalesce(available_sat, false),
  miryang_day_sun = coalesce(can_miryang, false) and coalesce(available_sun, false);

alter table public.customers
  add column if not exists preferred_pool_options jsonb not null default '{}'::jsonb,
  add column if not exists youth_participant_count integer,
  add column if not exists youth_ages text;

alter table public.customers
  drop constraint if exists customers_youth_participant_count_check,
  add constraint customers_youth_participant_count_check
    check (youth_participant_count is null or youth_participant_count between 1 and 20);
