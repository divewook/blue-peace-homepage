-- A new assignment generation makes a previous instructor's delivery record historical.
alter table public.customers
  add column assignment_generation integer not null default 0
  check (assignment_generation >= 0);

create function public.advance_customer_assignment_generation() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.matched_instructor_id is distinct from old.matched_instructor_id then
    new.assignment_generation := old.assignment_generation + 1;
  else
    new.assignment_generation := old.assignment_generation;
  end if;
  return new;
end $$;
create trigger advance_customer_assignment_generation_before_update
  before update on public.customers
  for each row execute function public.advance_customer_assignment_generation();

create table public.customer_assignment_delivery_events (
  id bigint generated always as identity primary key,
  customer_id uuid not null references public.customers(id) on delete cascade,
  instructor_id uuid not null,
  assignment_generation integer not null check (assignment_generation >= 0),
  action text not null check (action in ('marked','unmarked')),
  actor_identifier text not null check (actor_identifier = 'admin'),
  actor_session_fingerprint text not null check (actor_session_fingerprint ~ '^[0-9a-f]{24}$'),
  request_key uuid not null unique,
  created_at timestamptz not null default now()
);
create index customer_assignment_delivery_lookup_idx
  on public.customer_assignment_delivery_events(customer_id, assignment_generation, id desc);
alter table public.customer_assignment_delivery_events enable row level security;
revoke all on public.customer_assignment_delivery_events from public, anon, authenticated;
grant select, insert on public.customer_assignment_delivery_events to service_role;
grant usage, select on sequence public.customer_assignment_delivery_events_id_seq to service_role;

-- The route verifies the signed admin session. The RPC rechecks assignment and
-- state while holding the application row lock, preventing stale marks after reassignment.
create function public.record_customer_assignment_delivery(
  p_customer uuid, p_expected_instructor uuid, p_expected_generation integer,
  p_action text, p_expected_event_id bigint, p_request_key uuid, p_actor_session text
) returns public.customer_assignment_delivery_events
language plpgsql security invoker set search_path = '' as $$
declare
  application public.customers;
  prior public.customer_assignment_delivery_events;
  recorded public.customer_assignment_delivery_events;
begin
  if p_action not in ('marked','unmarked') or p_request_key is null or
    p_actor_session !~ '^[0-9a-f]{24}$' then
    raise exception 'invalid_delivery_request';
  end if;
  select * into prior from public.customer_assignment_delivery_events where request_key = p_request_key;
  if found then
    if prior.customer_id is distinct from p_customer or prior.instructor_id is distinct from p_expected_instructor
      or prior.assignment_generation is distinct from p_expected_generation or prior.action <> p_action then
      raise exception 'request_key_conflict';
    end if;
    return prior;
  end if;
  select * into application from public.customers where id = p_customer for update;
  if not found then raise exception 'application_not_found'; end if;
  if application.matched_instructor_id is null or
    application.matched_instructor_id is distinct from p_expected_instructor or
    application.assignment_generation is distinct from p_expected_generation then
    raise exception 'assignment_changed';
  end if;
  select * into prior from public.customer_assignment_delivery_events
    where customer_id = p_customer and instructor_id = p_expected_instructor
      and assignment_generation = p_expected_generation
    order by id desc limit 1;
  if prior.id is distinct from p_expected_event_id then raise exception 'stale_delivery_state'; end if;
  if (p_action = 'marked' and prior.action = 'marked') or
    (p_action = 'unmarked' and (prior.id is null or prior.action = 'unmarked')) then
    raise exception 'delivery_state_unchanged';
  end if;
  insert into public.customer_assignment_delivery_events
    (customer_id,instructor_id,assignment_generation,action,actor_identifier,actor_session_fingerprint,request_key)
    values (p_customer,p_expected_instructor,p_expected_generation,p_action,'admin',p_actor_session,p_request_key)
    returning * into recorded;
  return recorded;
end $$;
revoke all on function public.record_customer_assignment_delivery(uuid,uuid,integer,text,bigint,uuid,text)
  from public, anon, authenticated;
grant execute on function public.record_customer_assignment_delivery(uuid,uuid,integer,text,bigint,uuid,text)
  to service_role;
