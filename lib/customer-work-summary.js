export async function enrichCustomerWork(db, customers) {
  if (!customers?.length) return [];
  const ids=customers.map(item=>item.id);
  const instructorIds=[...new Set(customers.map(item=>item.matched_instructor_id).filter(Boolean))];
  const [workflowResult,lessonResult]=await Promise.all([
    db.from('customer_workflows').select('customer_id,status,task_title,task_due_at,task_completed_at').in('customer_id',ids),
    db.from('customer_lessons').select('customer_id,instructor_id,lesson_date,start_time,ends_at,status').in('instructor_id',instructorIds.length?instructorIds:['00000000-0000-0000-0000-000000000000']).eq('status','confirmed').gte('ends_at',new Date().toISOString()).order('starts_at',{ascending:true}),
  ]);
  if(workflowResult.error||lessonResult.error) throw workflowResult.error||lessonResult.error;
  const workflows=new Map((workflowResult.data||[]).map(item=>[item.customer_id,item]));
  const lessons=new Map();
  for(const item of lessonResult.data||[]) if(!lessons.has(item.customer_id)) lessons.set(item.customer_id,item);
  return customers.map(item=>({...item,workflow:workflows.get(item.id)||null,next_lesson:lessons.get(item.id)||null}));
}
