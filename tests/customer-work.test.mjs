import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateLessonInput, validateWorkflowPatch } from '../lib/customer-work.js';
const instructor = { schedule_by_day:{passnine:{mon:['t4'],sat:['t2']}} };
const customer = { course:'프리다이빙' };
const base = {status:'confirmed',lesson_date:'2030-01-07',start_time:'19:30',end_time:'22:00',pool_id:'passnine',customer_agreed:true,operation_checked:true,operation_evidence:'풀장 담당자 확인'};
test('consultation close needs reason',()=>{
  assert.match(validateWorkflowPatch({status:'closed'}),/종료 사유/);
  assert.equal(validateWorkflowPatch({status:'closed',end_reason:'withdrawn'}),null);
});
test('lesson requires customer agreement and operation evidence',()=>{
  assert.match(validateLessonInput({...base,customer_agreed:false},customer,instructor,null,[]),/고객/);
  assert.match(validateLessonInput({...base,operation_evidence:''},customer,instructor,null,[]),/운영/);
  assert.equal(validateLessonInput(base,customer,instructor,null,[]),null);
});
test('outside weekly schedule requires exceptional agreement and reason',()=>{
  const offSchedule={...base,start_time:'16:00',end_time:'18:30'};
  assert.match(validateLessonInput(offSchedule,customer,instructor,null,[]),/예외/);
  assert.equal(validateLessonInput({...offSchedule,exception_agreed:true,exception_reason:'고객과 다른 시간 합의'},customer,instructor,null,[]),null);
});
test('closed pool and out of hours are rejected',()=>{
  assert.match(validateLessonInput({...base,pool_id:'duryu'},customer,instructor,null,[]),/풀장/);
  assert.match(validateLessonInput({...base,start_time:'07:00'},customer,instructor,null,[]),/회차/);
});
test('another pool on same day requires travel check',()=>{
  const existing=[{id:'other',status:'confirmed',pool_id:'miryang',lesson_date:base.lesson_date}];
  assert.match(validateLessonInput(base,customer,instructor,null,existing),/이동/);
  assert.equal(validateLessonInput({...base,travel_checked:true,travel_reason:'이동 가능 확인'},customer,instructor,null,existing),null);
});
