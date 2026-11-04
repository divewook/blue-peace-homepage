-- Run only after tests/direct-consultation-bootstrap.sql and the listed
-- migrations on a disposable PostgreSQL instance. The fixture rolls back.
\set ON_ERROR_STOP on
begin;
insert into public.instructors(id,name,is_approved,course_levels) values
 ('11111111-1111-4111-8111-111111111111','가상 강사 A',true,'{"프리다이빙":"1레벨 (프리다이버)"}'),
 ('22222222-2222-4222-8222-222222222222','가상 강사 B',true,'{"프리다이빙":"1레벨 (프리다이버)"}');

-- Simulate the customer POST insert, including the existing request key and
-- attribution columns. No automatic assignment or workflow may appear.
insert into public.customers(id,name,phone,course,pool,time_slot,matched_instructor,matched_instructor_id,
 schedule_mode,schedule_alternatives,request_key,request_status,consultation_source,consultation_status,
 interest_course_id,interest_level_id,contact_window,inquiry_text,privacy_consent_version,privacy_consent_at,
 marketing_consent,traffic_source)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','가상 고객','010-0000-0000','프리다이빙 (1레벨 (프리다이버))',
 '상담 후 협의','상담 후 협의','배정 대기',null,'flexible','[]',
 '00000000-0000-4000-8000-000000000001','pending_assignment','direct','new',
 'freediving','level1','evening','가상 문의','2026-11-04',now(),true,'naver');
do $$ begin
 if (select count(*) from public.customers where consultation_source='direct' and matched_instructor_id is null and consultation_status='new')<>1 then raise exception 'direct insert failed'; end if;
 if exists(select 1 from public.customer_workflows where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') then raise exception 'new lead was automatically assigned'; end if;
 begin
  insert into public.customers(name,phone,course,pool,time_slot,matched_instructor,request_key)
  values('중복','010-0000-0000','교육','상담 후 협의','상담 후 협의','배정 대기','00000000-0000-4000-8000-000000000001');
  raise exception 'duplicate request key accepted';
 exception when unique_violation then null; end;
end $$;

-- Admin status, note, and task before an instructor is selected.
select public.save_customer_direct_consultation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',0,
 'status','attempted',null,'00000000-0000-4000-8000-000000000002','0123456789abcdef01234567');
select public.save_customer_workflow('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin',null,0,
 '{"internal_note":"가상 통화 메모","task_title":"다음 통화","last_contact_result":"통화 시도"}',
 '00000000-0000-4000-8000-000000000003');
do $$ begin
 if (select consultation_status from public.customers where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>'attempted' then raise exception 'status not stored'; end if;
 if (select internal_note from public.customer_workflows where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>'가상 통화 메모' then raise exception 'memo not stored'; end if;
end $$;

-- Manual assignment preserves the note and gives the current instructor access.
select public.save_customer_direct_consultation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,
 'assign',null,'11111111-1111-4111-8111-111111111111',
 '00000000-0000-4000-8000-000000000004','0123456789abcdef01234567');
do $$ begin
 if (select request_status from public.customers where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>'matched' then raise exception 'manual assignment failed'; end if;
 if (select internal_note from public.customer_workflows where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>'가상 통화 메모' then raise exception 'assignment lost memo'; end if;
 if (select task_assignee_id from public.customer_workflows where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>'11111111-1111-4111-8111-111111111111' then raise exception 'task assignee missing'; end if;
 if (select count(*) from public.customer_consultation_events where customer_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>2 then raise exception 'audit history missing'; end if;
 if (select count(*) from public.customers where matched_instructor_id='11111111-1111-4111-8111-111111111111')<>1 then raise exception 'instructor lookup failed'; end if;
 if (select count(*) from public.customers where matched_instructor_id='22222222-2222-4222-8222-222222222222')<>0 then raise exception 'other instructor can see request'; end if;
end $$;

-- Idempotent retry, stale-screen rejection, and old matching row compatibility.
select public.save_customer_direct_consultation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,
 'assign',null,'11111111-1111-4111-8111-111111111111',
 '00000000-0000-4000-8000-000000000004','0123456789abcdef01234567');
do $$ begin
 if (select consultation_revision from public.customers where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')<>2 then raise exception 'retry changed revision'; end if;
 begin
  perform public.save_customer_direct_consultation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,
   'status','consulting',null,'00000000-0000-4000-8000-000000000005','0123456789abcdef01234567');
  raise exception 'stale edit accepted';
 exception when raise_exception then if sqlerrm<>'stale_revision' then raise; end if; end;
end $$;
insert into public.customers(id,name,phone,course,pool,time_slot,matched_instructor,matched_instructor_id)
values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','과거 가상 고객','010-0000-0000','기존 교육','기존 풀장','기존 회차','가상 강사 B','22222222-2222-4222-8222-222222222222');
do $$ begin
 if (select consultation_source from public.customers where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') is not null then raise exception 'legacy row reinterpreted'; end if;
 if not exists(select 1 from public.customer_workflows where customer_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') then raise exception 'legacy assignment workflow missing'; end if;
 begin
  perform public.save_customer_direct_consultation('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',0,
   'status','closed',null,'00000000-0000-4000-8000-000000000006','0123456789abcdef01234567');
  raise exception 'legacy request modified by direct RPC';
 exception when raise_exception then if sqlerrm<>'not_direct_consultation' then raise; end if; end;
end $$;

do $$ begin
 if not (select relrowsecurity from pg_class where oid='public.customers'::regclass) then raise exception 'customer RLS disabled'; end if;
 if not (select relrowsecurity from pg_class where oid='public.customer_consultation_events'::regclass) then raise exception 'consultation event RLS disabled'; end if;
 if has_table_privilege('anon','public.customers','SELECT') then raise exception 'customers exposed to anonymous API'; end if;
 if has_table_privilege('authenticated','public.customers','SELECT') then raise exception 'customers exposed to authenticated Data API'; end if;
 if has_table_privilege('anon','public.customer_consultation_events','SELECT') then raise exception 'consultation history exposed to anonymous API'; end if;
 if has_function_privilege('anon','public.save_customer_direct_consultation(uuid,integer,text,text,uuid,uuid,text)','EXECUTE') then raise exception 'anonymous direct RPC access'; end if;
 if not has_function_privilege('service_role','public.save_customer_direct_consultation(uuid,integer,text,text,uuid,uuid,text)','EXECUTE') then raise exception 'service role cannot save direct consultation'; end if;
end $$;

select 'direct consultation local integration passed' as result;
rollback;
