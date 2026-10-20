-- Lock the application before looking up an idempotency key so simultaneous retries see the first committed event.
create or replace function public.record_customer_assignment_delivery(
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
  select * into application from public.customers where id = p_customer for update;
  if not found then raise exception 'application_not_found'; end if;
  select * into prior from public.customer_assignment_delivery_events where request_key = p_request_key;
  if found then
    if prior.customer_id is distinct from p_customer or prior.instructor_id is distinct from p_expected_instructor
      or prior.assignment_generation is distinct from p_expected_generation or prior.action <> p_action then
      raise exception 'request_key_conflict';
    end if;
    return prior;
  end if;
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
