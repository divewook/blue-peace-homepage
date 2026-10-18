-- Stage 3 manages one active first-lesson plan per application. Cancelled plans remain as history.
create unique index customer_one_active_first_lesson_idx
  on public.customer_lessons(customer_id)
  where status in ('proposed','confirmed');

create function public.guard_customer_workflow_consistency() returns trigger
language plpgsql security invoker as $$
begin
  if tg_op = 'UPDATE' and
    (new.task_title is distinct from old.task_title or new.task_due_at is distinct from old.task_due_at) and
    new.task_completed_at is not distinct from old.task_completed_at then
    new.task_completed_at := null;
  end if;
  if new.status = 'closed' and exists (
    select 1 from public.customer_lessons
    where customer_id = new.customer_id and status = 'confirmed' and ends_at > now()
  ) then
    raise exception 'future_confirmed_lesson_exists';
  end if;
  if new.status = 'first_lesson_confirmed' and not exists (
    select 1 from public.customer_lessons
    where customer_id = new.customer_id and status = 'confirmed'
  ) then
    raise exception 'confirmed_lesson_required';
  end if;
  return new;
end $$;
create trigger guard_customer_workflow_consistency_before_write
  before insert or update on public.customer_workflows
  for each row execute function public.guard_customer_workflow_consistency();

create function public.guard_customer_lesson_consistency() returns trigger
language plpgsql security invoker as $$
begin
  if new.status in ('proposed','confirmed') and exists (
    select 1 from public.customer_workflows
    where customer_id = new.customer_id and status = 'closed'
  ) then
    raise exception 'consultation_closed';
  end if;
  return new;
end $$;
create trigger guard_customer_lesson_consistency_before_write
  before insert or update on public.customer_lessons
  for each row execute function public.guard_customer_lesson_consistency();
