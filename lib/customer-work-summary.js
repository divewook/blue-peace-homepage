export function buildCustomerWorkSummary(customers, workflowRows, lessonRows, now = Date.now()) {
  const workflows = new Map(workflowRows.map(item => [item.customer_id, item]));
  const lessons = new Map();
  for (const item of lessonRows) {
    if (item.status !== 'confirmed') continue;
    const current = lessons.get(item.customer_id) || [];
    current.push(item);
    lessons.set(item.customer_id, current);
  }
  return customers.map(item => {
    const workflow = workflows.get(item.id) || null;
    const allConfirmed = lessons.get(item.id) || [];
    const allUpcoming = allConfirmed.filter(lesson => new Date(lesson.ends_at).getTime() > now);
    const assignedUpcoming = allUpcoming.filter(lesson => lesson.instructor_id === item.matched_instructor_id)
      .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());
    const pastUnresolved = allConfirmed.filter(lesson => lesson.instructor_id === item.matched_instructor_id
      && new Date(lesson.ends_at).getTime() <= now);
    return {
      ...item, workflow, next_lesson: assignedUpcoming[0] || null,
      upcoming_lesson_count: assignedUpcoming.length,
      past_unresolved_lesson_count: pastUnresolved.length,
      closed_with_future_lesson: workflow?.status === 'closed' && allUpcoming.length > 0,
      reassigned_future_lesson_count: allUpcoming.length - assignedUpcoming.length,
    };
  });
}

export async function enrichCustomerWork(db, customers) {
  if (!customers?.length) return [];
  const ids = customers.map(item => item.id);
  const now = Date.now();
  const [workflowResult, lessonResult] = await Promise.all([
    db.from('customer_workflows').select('customer_id,status,task_title,task_due_at,task_completed_at').in('customer_id', ids),
    db.from('customer_lessons').select('customer_id,instructor_id,lesson_date,start_time,ends_at,status')
      .in('customer_id', ids).eq('status', 'confirmed').order('ends_at', { ascending: true }),
  ]);
  if (workflowResult.error || lessonResult.error) throw workflowResult.error || lessonResult.error;
  return buildCustomerWorkSummary(customers, workflowResult.data || [], lessonResult.data || [], now);
}

export function customerWorkPriority(customer, now) {
  if (customer.workflow?.status === 'closed') return 5;
  if (customer.workflow?.task_title && !customer.workflow.task_completed_at && customer.workflow.task_due_at
    && new Date(customer.workflow.task_due_at).getTime() < now) return 0;
  if (!customer.workflow?.status || customer.workflow.status === 'contact_needed' || customer.past_unresolved_lesson_count) return 1;
  if (customer.upcoming_lesson_count) return 2;
  if (customer.workflow.status === 'schedule_discussion') return 3;
  return 4;
}

export function customerWorkTotals(customers, now) {
  return {
    overdue: customers.filter(customer => customerWorkPriority(customer, now) === 0).length,
    contact: customers.filter(customer => customerWorkPriority(customer, now) === 1).length,
    upcoming: customers.reduce((total, customer) => total + (customer.upcoming_lesson_count || 0), 0),
    nearest: [...customers].filter(customer => customer.next_lesson)
      .sort((a, b) => `${a.next_lesson.lesson_date} ${a.next_lesson.start_time}`.localeCompare(`${b.next_lesson.lesson_date} ${b.next_lesson.start_time}`))[0] || null,
  };
}
