-- Run with both delivery migrations in a disposable PostgreSQL database only.
\set ON_ERROR_STOP on
begin;
insert into public.instructors(id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');
insert into public.customers(id,matched_instructor_id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111');
set local role service_role;

do $$
declare recorded public.customer_assignment_delivery_events; next_event public.customer_assignment_delivery_events;
begin
  recorded := public.record_customer_assignment_delivery(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',0,
    'marked',null,'10000000-0000-4000-8000-000000000001','0123456789abcdef01234567');
  if recorded.action <> 'marked' or recorded.actor_identifier <> 'admin' then raise exception 'mark failed'; end if;
  if (public.record_customer_assignment_delivery(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',0,
    'marked',null,'10000000-0000-4000-8000-000000000001','0123456789abcdef01234567')).id <> recorded.id then
    raise exception 'retry duplicated event'; end if;
  begin
    perform public.record_customer_assignment_delivery(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',0,
      'unmarked',null,'10000000-0000-4000-8000-000000000002','0123456789abcdef01234567');
    raise exception 'stale state accepted';
  exception when raise_exception then if sqlerrm <> 'stale_delivery_state' then raise; end if; end;
  next_event := public.record_customer_assignment_delivery(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',0,
    'unmarked',recorded.id,'10000000-0000-4000-8000-000000000003','0123456789abcdef01234567');
  if next_event.id <= recorded.id then raise exception 'undo history missing'; end if;
  recorded := public.record_customer_assignment_delivery(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',0,
    'marked',next_event.id,'10000000-0000-4000-8000-000000000004','0123456789abcdef01234567');

  update public.customers set matched_instructor_id='22222222-2222-4222-8222-222222222222'
    where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  if (select assignment_generation from public.customers where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'reassignment generation missing'; end if;
  begin
    perform public.record_customer_assignment_delivery(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',0,
      'unmarked',recorded.id,'10000000-0000-4000-8000-000000000005','0123456789abcdef01234567');
    raise exception 'old instructor accepted';
  exception when raise_exception then if sqlerrm <> 'assignment_changed' then raise; end if; end;
  next_event := public.record_customer_assignment_delivery(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222',1,
    'marked',null,'10000000-0000-4000-8000-000000000006','0123456789abcdef01234567');
  update public.customers set matched_instructor_id='11111111-1111-4111-8111-111111111111'
    where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  if (select assignment_generation from public.customers where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 2 then
    raise exception 'return assignment generation missing'; end if;
  if exists (select 1 from public.customer_assignment_delivery_events where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    and instructor_id='11111111-1111-4111-8111-111111111111' and assignment_generation=2) then
    raise exception 'old delivery carried into new assignment'; end if;
  if (select count(*) from public.customer_assignment_delivery_events where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 4 then
    raise exception 'history was lost'; end if;
end $$;

select has_table_privilege('anon','public.customer_assignment_delivery_events','SELECT') as anon_can_read,
  has_function_privilege('anon','public.record_customer_assignment_delivery(uuid,uuid,integer,text,bigint,uuid,text)','EXECUTE') as anon_can_write;
rollback;
