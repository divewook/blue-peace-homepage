-- Run only against a disposable PostgreSQL database with both Stage 3 migrations applied.
\set ON_ERROR_STOP on
begin;
insert into public.instructors(id,is_approved) values
  ('11111111-1111-4111-8111-111111111111',true),
  ('22222222-2222-4222-8222-222222222222',true);
insert into public.customers(id,matched_instructor_id,course) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','교육'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','11111111-1111-4111-8111-111111111111','교육'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','11111111-1111-4111-8111-111111111111','교육');

do $$
declare first_lesson public.customer_lessons; second_lesson public.customer_lessons; proposal jsonb;
begin
  if (select status from public.customer_workflows where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 'contact_needed' then
    raise exception 'new assignment initial state failed';
  end if;
  begin
    perform public.save_customer_workflow('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','instructor','22222222-2222-4222-8222-222222222222',0,'{"status":"consulting"}'::jsonb,'10000000-0000-4000-8000-000000000001');
    raise exception 'nonassigned instructor was allowed';
  exception when raise_exception then if sqlerrm <> 'access_denied' then raise; end if; end;

  proposal := '{"status":"proposed","lesson_date":"2030-01-07","start_time":"19:30","end_time":"22:00","pool_id":"passnine"}'::jsonb;
  first_lesson := public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'instructor','11111111-1111-4111-8111-111111111111',0,proposal,'10000000-0000-4000-8000-000000000002');
  if (select status from public.customer_workflows where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 'contact_needed' then
    raise exception 'proposal changed consultation status';
  end if;
  if (select count(*) from public.customer_lessons where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and status='confirmed') <> 0 then
    raise exception 'proposal counted as confirmed';
  end if;
  if (public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'instructor','11111111-1111-4111-8111-111111111111',0,proposal,'10000000-0000-4000-8000-000000000002')).id <> first_lesson.id then
    raise exception 'idempotent retry created another lesson';
  end if;
  begin
    perform public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'instructor','11111111-1111-4111-8111-111111111111',0,proposal,'10000000-0000-4000-8000-000000000003');
    raise exception 'second active first lesson was allowed';
  exception when unique_violation then null; end;
  begin
    perform public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',first_lesson.id,'instructor','11111111-1111-4111-8111-111111111111',0,proposal||'{"status":"confirmed"}'::jsonb,'10000000-0000-4000-8000-000000000004');
    raise exception 'confirmation without evidence was allowed';
  exception when raise_exception then if sqlerrm <> 'confirmation_evidence_required' then raise; end if; end;
  first_lesson := public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',first_lesson.id,'instructor','11111111-1111-4111-8111-111111111111',0,proposal||'{"status":"confirmed","customer_agreed":true,"operation_checked":true,"operation_evidence":"풀장 운영 확인"}'::jsonb,'10000000-0000-4000-8000-000000000005');
  if (select status from public.customer_workflows where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 'first_lesson_confirmed' then
    raise exception 'confirmation status missing';
  end if;
  begin
    perform public.save_customer_workflow('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','instructor','11111111-1111-4111-8111-111111111111',1,'{"status":"closed","end_reason":"other"}'::jsonb,'10000000-0000-4000-8000-000000000006');
    raise exception 'closed with future lesson';
  exception when raise_exception then if sqlerrm <> 'future_confirmed_lesson_exists' then raise; end if; end;
  if (select status from public.customer_lessons where id=first_lesson.id) <> 'confirmed' then raise exception 'failed close cancelled lesson'; end if;

  second_lesson := public.save_customer_lesson('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',null,'instructor','11111111-1111-4111-8111-111111111111',0,proposal||'{"status":"confirmed","customer_agreed":true,"operation_checked":true,"operation_evidence":"운영 확인","start_time":"16:00","end_time":"18:30"}'::jsonb,'10000000-0000-4000-8000-000000000007');
  begin
    perform public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',first_lesson.id,'instructor','11111111-1111-4111-8111-111111111111',1,proposal||'{"status":"confirmed","customer_agreed":true,"operation_checked":true,"operation_evidence":"운영 다시 확인","start_time":"16:00","end_time":"18:30","change_reason":"시간 변경"}'::jsonb,'10000000-0000-4000-8000-000000000008');
    raise exception 'conflicting reschedule was allowed';
  exception when exclusion_violation then null; end;
  if (select start_time from public.customer_lessons where id=first_lesson.id) <> '19:30'::time then raise exception 'failed change altered lesson'; end if;
  first_lesson := public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',first_lesson.id,'instructor','11111111-1111-4111-8111-111111111111',1,proposal||'{"status":"confirmed","customer_agreed":true,"operation_checked":true,"operation_evidence":"새 날짜 운영 확인","lesson_date":"2030-01-14","change_reason":"고객과 새 날짜 합의"}'::jsonb,'10000000-0000-4000-8000-000000000009');
  if first_lesson.lesson_date <> '2030-01-14'::date or first_lesson.customer_agreed_at is null or first_lesson.operation_checked_at is null then raise exception 'reschedule evidence missing'; end if;

  first_lesson := public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',first_lesson.id,'instructor','11111111-1111-4111-8111-111111111111',2,proposal||'{"status":"cancelled","lesson_date":"2030-01-14","change_reason":"고객과 취소 합의"}'::jsonb,'10000000-0000-4000-8000-000000000010');
  if (select status from public.customer_workflows where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 'schedule_discussion' then raise exception 'cancel did not reopen discussion'; end if;
  if (select count(*) from public.customer_lessons where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 1 then raise exception 'cancel deleted history'; end if;
  perform public.save_customer_lesson('cccccccc-cccc-4ccc-8ccc-cccccccccccc',null,'instructor','11111111-1111-4111-8111-111111111111',0,proposal||'{"status":"confirmed","customer_agreed":true,"operation_checked":true,"operation_evidence":"운영 확인","lesson_date":"2030-01-14"}'::jsonb,'10000000-0000-4000-8000-000000000015');
  perform public.save_customer_workflow('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','instructor','11111111-1111-4111-8111-111111111111',3,'{"status":"closed","end_reason":"withdrawn"}'::jsonb,'10000000-0000-4000-8000-000000000011');
  begin
    perform public.save_customer_lesson('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',null,'instructor','11111111-1111-4111-8111-111111111111',0,proposal,'10000000-0000-4000-8000-000000000012');
    raise exception 'proposal on closed consultation';
  exception when raise_exception then if sqlerrm <> 'consultation_closed' then raise; end if; end;

  perform public.save_customer_workflow('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','instructor','11111111-1111-4111-8111-111111111111',1,'{"task_title":"연락","task_due_at":"2030-01-02T00:00:00Z","task_completed":true}'::jsonb,'10000000-0000-4000-8000-000000000013');
  if (select task_completed_at from public.customer_workflows where customer_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') is null then raise exception 'task completion missing'; end if;
  perform public.save_customer_workflow('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','instructor','11111111-1111-4111-8111-111111111111',2,'{"task_due_at":"2030-01-03T00:00:00Z"}'::jsonb,'10000000-0000-4000-8000-000000000014');
  if (select task_completed_at from public.customer_workflows where customer_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') is not null then raise exception 'new task date stayed completed'; end if;
end $$;
rollback;
