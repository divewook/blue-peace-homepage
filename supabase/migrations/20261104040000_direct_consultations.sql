-- Additive fields. Historic matching requests retain their original meaning and status.
alter table public.customers
  add column if not exists consultation_source text,
  add column if not exists interest_course_id text,
  add column if not exists interest_level_id text,
  add column if not exists interest_goal text,
  add column if not exists contact_window text,
  add column if not exists inquiry_text text,
  add column if not exists consultation_status text,
  add column if not exists consultation_revision integer not null default 0;

alter table public.customers
  add constraint customers_consultation_source_check check (consultation_source is null or consultation_source = 'direct'),
  add constraint customers_contact_window_check check (contact_window is null or contact_window in ('morning','afternoon','evening','anytime')),
  add constraint customers_consultation_status_check check (consultation_status is null or consultation_status in ('new','attempted','consulting','registered','on_hold','closed')),
  add constraint customers_consultation_revision_check check (consultation_revision >= 0);

create index customers_direct_status_created_idx on public.customers(consultation_status, created_at desc)
  where consultation_source = 'direct';

create table public.customer_consultation_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  action text not null check (action in ('status','assign')),
  before_data jsonb not null,
  after_data jsonb not null,
  actor_session_fingerprint text not null check (actor_session_fingerprint ~ '^[0-9a-f]{24}$'),
  request_key uuid not null unique,
  created_at timestamptz not null default now()
);
create index customer_consultation_events_customer_idx on public.customer_consultation_events(customer_id,created_at desc);
alter table public.customer_consultation_events enable row level security;
revoke all on public.customer_consultation_events from public,anon,authenticated;
grant select,insert on public.customer_consultation_events to service_role;

-- The server verifies the signed admin cookie. This transaction also checks the
-- current revision, instructor approval, and the idempotency key under a row lock.
create function public.save_customer_direct_consultation(
  p_customer uuid, p_expected_revision integer, p_action text,
  p_status text, p_instructor uuid, p_request_key uuid, p_actor_session text
) returns public.customers language plpgsql security invoker set search_path = '' as $$
declare
  application public.customers;
  selected_instructor public.instructors;
  previous public.customer_consultation_events;
  before_state jsonb;
begin
  if p_request_key is null or p_actor_session is null or p_actor_session !~ '^[0-9a-f]{24}$'
    or p_action is null or p_action not in ('status','assign')
    or p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'invalid_consultation_request';
  end if;
  select * into previous from public.customer_consultation_events where request_key = p_request_key;
  if found then
    if previous.customer_id is distinct from p_customer or previous.action <> p_action
      or previous.actor_session_fingerprint <> p_actor_session then raise exception 'request_key_conflict'; end if;
    select * into application from public.customers where id = p_customer;
    return application;
  end if;
  select * into application from public.customers where id = p_customer for update;
  if not found then raise exception 'application_not_found'; end if;
  if application.consultation_source is distinct from 'direct' then raise exception 'not_direct_consultation'; end if;
  if application.consultation_revision <> p_expected_revision then raise exception 'stale_revision'; end if;
  before_state := jsonb_build_object('status',application.consultation_status,
    'instructor_id',application.matched_instructor_id,'generation',application.assignment_generation);
  if p_action = 'status' then
    if p_status is null or p_status not in ('new','attempted','consulting','registered','on_hold','closed') then raise exception 'invalid_status'; end if;
    update public.customers set consultation_status = p_status,consultation_revision = consultation_revision+1
      where id=p_customer returning * into application;
  else
    if p_instructor is null then raise exception 'instructor_required'; end if;
    select * into selected_instructor from public.instructors where id=p_instructor and is_approved=true;
    if not found then raise exception 'instructor_unavailable'; end if;
    if application.matched_instructor_id is not distinct from p_instructor then raise exception 'already_assigned'; end if;
    update public.customers set matched_instructor_id=p_instructor, matched_instructor=selected_instructor.name,
      request_status='matched', consultation_revision=consultation_revision+1
      where id=p_customer returning * into application;
    insert into public.customer_workflows(customer_id,status,task_title,task_assignee_id)
      values(p_customer,'contact_needed','고객에게 첫 연락',p_instructor)
      on conflict(customer_id) do update set status=coalesce(customer_workflows.status,'contact_needed'),
        task_title=coalesce(customer_workflows.task_title,'고객에게 첫 연락'),task_assignee_id=p_instructor,
        revision=customer_workflows.revision+1,updated_at=now();
  end if;
  insert into public.customer_consultation_events(customer_id,action,before_data,after_data,actor_session_fingerprint,request_key)
  values(p_customer,p_action,before_state,jsonb_build_object('status',application.consultation_status,
    'instructor_id',application.matched_instructor_id,'generation',application.assignment_generation),
    p_actor_session,p_request_key);
  return application;
end $$;
revoke all on function public.save_customer_direct_consultation(uuid,integer,text,text,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.save_customer_direct_consultation(uuid,integer,text,text,uuid,uuid,text) to service_role;
