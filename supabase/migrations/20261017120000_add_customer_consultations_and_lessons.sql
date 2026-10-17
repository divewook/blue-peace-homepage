-- Additive workflow records. Existing applications intentionally have no workflow row.
create extension if not exists btree_gist;
create table public.customer_workflows (
  customer_id uuid primary key references public.customers(id) on delete cascade,
  status text check (status in ('contact_needed','consulting','awaiting_customer','schedule_discussion','first_lesson_confirmed','closed')),
  end_reason text check (end_reason in ('withdrawn','unreachable','conditions_mismatch','duplicate','other')),
  last_contact_at timestamptz,
  last_contact_result text,
  internal_note text,
  task_title text,
  task_due_at timestamptz,
  task_completed_at timestamptz,
  task_assignee_id uuid references public.instructors(id) on delete set null,
  revision integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint closed_has_reason check ((status = 'closed') = (end_reason is not null))
);
create table public.customer_lessons (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  instructor_id uuid references public.instructors(id) on delete set null,
  course text not null,
  lesson_date date not null,
  start_time time not null,
  end_time time not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  pool_id text not null,
  status text not null check (status in ('proposed','confirmed','cancelled')),
  customer_agreed_at timestamptz,
  customer_agreed_by text,
  operation_evidence text,
  operation_checked_at timestamptz,
  operation_checked_by text,
  exception_reason text,
  travel_reason text,
  change_reason text,
  revision integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_time_order check (end_time > start_time and ends_at > starts_at),
  constraint confirmed_evidence check (status <> 'confirmed' or
    (customer_agreed_at is not null and operation_checked_at is not null and length(trim(operation_evidence)) > 0))
);
alter table public.customer_lessons add constraint instructor_confirmed_lesson_overlap
  exclude using gist (instructor_id with =, tstzrange(starts_at, ends_at, '[)') with &&)
  where (status = 'confirmed' and instructor_id is not null);
create index customer_lessons_customer_idx on public.customer_lessons(customer_id, lesson_date);
create index customer_lessons_instructor_idx on public.customer_lessons(instructor_id, starts_at) where status = 'confirmed';
create table public.customer_workflow_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  lesson_id uuid references public.customer_lessons(id) on delete set null,
  actor_type text not null check (actor_type in ('admin','instructor','system')),
  actor_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  request_key uuid unique,
  created_at timestamptz not null default now()
);
create index customer_workflow_events_customer_idx on public.customer_workflow_events(customer_id, created_at desc);

alter table public.customer_workflows enable row level security;
alter table public.customer_lessons enable row level security;
alter table public.customer_workflow_events enable row level security;
revoke all on public.customer_workflows, public.customer_lessons, public.customer_workflow_events from public, anon, authenticated;

create function public.init_customer_workflow() returns trigger language plpgsql security invoker as $$
begin
  if new.matched_instructor_id is not null then
    insert into public.customer_workflows(customer_id, status, task_title, task_assignee_id)
    values (new.id, 'contact_needed', '고객에게 첫 연락', new.matched_instructor_id)
    on conflict (customer_id) do nothing;
  end if;
  return new;
end $$;
create trigger init_customer_workflow_after_insert after insert on public.customers
  for each row execute function public.init_customer_workflow();

create function public.audit_customer_assignment() returns trigger language plpgsql security invoker as $$
begin
  if old.matched_instructor_id is distinct from new.matched_instructor_id then
    update public.customer_workflows set task_assignee_id=new.matched_instructor_id,revision=revision+1,updated_at=now()
      where customer_id=new.id;
    insert into public.customer_workflow_events(customer_id,actor_type,action,before_data,after_data)
      values(new.id,'system','assignment_changed',jsonb_build_object('instructor_id',old.matched_instructor_id),
        jsonb_build_object('instructor_id',new.matched_instructor_id));
  end if;
  return new;
end $$;
create trigger audit_customer_assignment_after_update after update of matched_instructor_id on public.customers
  for each row execute function public.audit_customer_assignment();

-- The route resolves the signed session. The RPC rechecks current ownership while holding the application lock.
create function public.save_customer_workflow(
  p_customer uuid, p_actor_type text, p_actor_id uuid, p_expected_revision integer,
  p_patch jsonb, p_request_key uuid
) returns public.customer_workflows language plpgsql security invoker as $$
declare c public.customers; w public.customer_workflows; prior jsonb; event_row public.customer_workflow_events;
begin
  select * into c from public.customers where id = p_customer for update;
  if not found then raise exception 'application_not_found'; end if;
  if p_actor_type <> 'admin' and (p_actor_type <> 'instructor' or c.matched_instructor_id is distinct from p_actor_id
    or not exists(select 1 from public.instructors where id=p_actor_id and is_approved)) then
    raise exception 'access_denied';
  end if;
  select * into event_row from public.customer_workflow_events where request_key=p_request_key;
  if found then
    if event_row.customer_id <> p_customer or event_row.actor_type <> p_actor_type or event_row.actor_id is distinct from p_actor_id then raise exception 'request_key_conflict'; end if;
    select * into w from public.customer_workflows where customer_id=p_customer;
    return w;
  end if;
  select * into w from public.customer_workflows where customer_id=p_customer for update;
  if not found then
    if p_expected_revision <> 0 then raise exception 'stale_revision'; end if;
    insert into public.customer_workflows(customer_id, task_assignee_id) values(p_customer,c.matched_instructor_id) returning * into w;
  end if;
  if w.revision <> p_expected_revision then raise exception 'stale_revision'; end if;
  prior := to_jsonb(w);
  update public.customer_workflows set
    status = case when p_patch ? 'status' then nullif(p_patch->>'status','') else status end,
    end_reason = case when p_patch ? 'end_reason' then nullif(p_patch->>'end_reason','') else end_reason end,
    last_contact_at = case when p_patch ? 'last_contact_result' and nullif(p_patch->>'last_contact_result','') is not null then now() else last_contact_at end,
    last_contact_result = case when p_patch ? 'last_contact_result' then nullif(p_patch->>'last_contact_result','') else last_contact_result end,
    internal_note = case when p_patch ? 'internal_note' then nullif(p_patch->>'internal_note','') else internal_note end,
    task_title = case when p_patch ? 'task_title' then nullif(p_patch->>'task_title','') else task_title end,
    task_due_at = case when p_patch ? 'task_due_at' then nullif(p_patch->>'task_due_at','')::timestamptz else task_due_at end,
    task_completed_at = case when p_patch ? 'task_completed' then case when (p_patch->>'task_completed')::boolean then now() else null end else task_completed_at end,
    task_assignee_id = c.matched_instructor_id,
    revision = revision+1, updated_at=now()
  where customer_id=p_customer returning * into w;
  insert into public.customer_workflow_events(customer_id,actor_type,actor_id,action,before_data,after_data,request_key)
  values(p_customer,p_actor_type,p_actor_id,'workflow_updated',prior,to_jsonb(w),p_request_key);
  return w;
end $$;

create function public.save_customer_lesson(
  p_customer uuid, p_lesson uuid, p_actor_type text, p_actor_id uuid,
  p_expected_revision integer, p_payload jsonb, p_request_key uuid
) returns public.customer_lessons language plpgsql security invoker as $$
declare c public.customers; l public.customer_lessons; prior jsonb; event_row public.customer_workflow_events;
  v_status text; v_date date; v_start time; v_end time; v_starts timestamptz; v_ends timestamptz;
begin
  select * into c from public.customers where id=p_customer for update;
  if not found then raise exception 'application_not_found'; end if;
  if c.matched_instructor_id is null then raise exception 'assignment_required'; end if;
  if p_actor_type <> 'admin' and (p_actor_type <> 'instructor' or c.matched_instructor_id is distinct from p_actor_id
    or not exists(select 1 from public.instructors where id=p_actor_id and is_approved)) then raise exception 'access_denied'; end if;
  select * into event_row from public.customer_workflow_events where request_key=p_request_key;
  if found then
    if event_row.customer_id <> p_customer or event_row.actor_type <> p_actor_type or event_row.actor_id is distinct from p_actor_id then raise exception 'request_key_conflict'; end if;
    select * into l from public.customer_lessons where id=event_row.lesson_id;
    return l;
  end if;
  if p_lesson is not null then
    select * into l from public.customer_lessons where id=p_lesson and customer_id=p_customer for update;
    if not found then raise exception 'lesson_not_found'; end if;
    if l.instructor_id is distinct from c.matched_instructor_id then raise exception 'lesson_assignment_changed'; end if;
    if l.revision <> p_expected_revision then raise exception 'stale_revision'; end if;
    prior := to_jsonb(l);
    if l.status='confirmed' and coalesce(trim(p_payload->>'change_reason'),'')='' then raise exception 'change_reason_required'; end if;
  elsif p_expected_revision <> 0 then raise exception 'stale_revision'; end if;
  v_status := p_payload->>'status';
  if v_status not in ('proposed','confirmed','cancelled') then raise exception 'invalid_status'; end if;
  if v_status='cancelled' and p_lesson is null then raise exception 'lesson_not_found'; end if;
  if p_lesson is not null and l.status='cancelled' and v_status <> 'cancelled' then raise exception 'cancelled_lesson'; end if;
  v_date := (p_payload->>'lesson_date')::date;
  v_start := (p_payload->>'start_time')::time;
  v_end := (p_payload->>'end_time')::time;
  v_starts := (v_date+v_start) at time zone 'Asia/Seoul';
  v_ends := (v_date+v_end) at time zone 'Asia/Seoul';
  if v_status <> 'cancelled' and (v_end <= v_start or v_starts <= now()) then raise exception 'invalid_lesson_time'; end if;
  if v_status='confirmed' and (coalesce((p_payload->>'customer_agreed')::boolean,false) is false
    or coalesce((p_payload->>'operation_checked')::boolean,false) is false
    or coalesce(trim(p_payload->>'operation_evidence'),'')='') then raise exception 'confirmation_evidence_required'; end if;
  if v_status='confirmed' then
    -- Serialize confirmations for one instructor, including nonoverlapping lessons at different pools.
    perform pg_advisory_xact_lock(hashtextextended(c.matched_instructor_id::text, 0));
    if exists (select 1 from public.customer_lessons other
      where other.instructor_id=c.matched_instructor_id and other.status='confirmed'
        and other.lesson_date=v_date and other.pool_id is distinct from p_payload->>'pool_id'
        and other.id is distinct from p_lesson)
      and coalesce(trim(p_payload->>'travel_reason'),'')='' then raise exception 'travel_confirmation_required'; end if;
  end if;
  if p_lesson is null then
    insert into public.customer_lessons(customer_id,instructor_id,course,lesson_date,start_time,end_time,starts_at,ends_at,pool_id,status,
      customer_agreed_at,customer_agreed_by,operation_checked_at,operation_checked_by,operation_evidence,exception_reason,travel_reason,change_reason)
    values(p_customer,c.matched_instructor_id,c.course,v_date,v_start,v_end,v_starts,v_ends,p_payload->>'pool_id',v_status,
      case when v_status='confirmed' then now() end,case when v_status='confirmed' then p_actor_type end,
      case when v_status='confirmed' then now() end,case when v_status='confirmed' then p_actor_type end,
      nullif(p_payload->>'operation_evidence',''),nullif(p_payload->>'exception_reason',''),nullif(p_payload->>'travel_reason',''),nullif(p_payload->>'change_reason','')) returning * into l;
  else
    update public.customer_lessons set instructor_id=c.matched_instructor_id,lesson_date=v_date,start_time=v_start,end_time=v_end,
      starts_at=v_starts,ends_at=v_ends,pool_id=p_payload->>'pool_id',status=v_status,
      customer_agreed_at=case when v_status='confirmed' then now() else null end,
      customer_agreed_by=case when v_status='confirmed' then p_actor_type else null end,
      operation_checked_at=case when v_status='confirmed' then now() else null end,
      operation_checked_by=case when v_status='confirmed' then p_actor_type else null end,
      operation_evidence=nullif(p_payload->>'operation_evidence',''),exception_reason=nullif(p_payload->>'exception_reason',''),
      travel_reason=nullif(p_payload->>'travel_reason',''),change_reason=nullif(p_payload->>'change_reason',''),
      revision=revision+1,updated_at=now() where id=p_lesson returning * into l;
  end if;
  insert into public.customer_workflow_events(customer_id,lesson_id,actor_type,actor_id,action,before_data,after_data,request_key)
  values(p_customer,l.id,p_actor_type,p_actor_id,'lesson_'||v_status,prior,to_jsonb(l),p_request_key);
  if v_status='confirmed' then
    insert into public.customer_workflows(customer_id,status,task_assignee_id) values(p_customer,'first_lesson_confirmed',c.matched_instructor_id)
    on conflict(customer_id) do update set status='first_lesson_confirmed',end_reason=null,task_assignee_id=c.matched_instructor_id,revision=customer_workflows.revision+1,updated_at=now();
  elsif prior->>'status'='confirmed' and not exists
    (select 1 from public.customer_lessons where customer_id=p_customer and status='confirmed') then
    update public.customer_workflows set status='schedule_discussion',end_reason=null,task_title='새 일정 협의',
      task_due_at=null,task_completed_at=null,revision=revision+1,updated_at=now()
    where customer_id=p_customer and status='first_lesson_confirmed';
  end if;
  return l;
end $$;
revoke all on function public.save_customer_workflow(uuid,text,uuid,integer,jsonb,uuid) from public,anon,authenticated;
revoke all on function public.save_customer_lesson(uuid,uuid,text,uuid,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.save_customer_workflow(uuid,text,uuid,integer,jsonb,uuid) to service_role;
grant execute on function public.save_customer_lesson(uuid,uuid,text,uuid,integer,jsonb,uuid) to service_role;
