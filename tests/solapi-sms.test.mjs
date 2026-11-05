import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { formatConsultationSms, sendSolapiConsultationSms, solapiAuthHeader } from '../lib/solapi-sms.js';

const env = { SOLAPI_ENABLED:'true', SOLAPI_API_KEY:'test-key', SOLAPI_API_SECRET:'test-secret', SOLAPI_SENDER_PHONE:'010-1111-2222', SOLAPI_ADMIN_PHONE:'010-9999-8888' };
const lead = { name:'가상\n고객', course:'프리다이빙 1+2레벨', contactWindow:'evening' };
const fakeResult = { failedMessageList:[], messageList:[{ messageId:'M4VFAKE', statusCode:'2000' }], groupInfo:{ groupId:'G4VFAKE', count:{ registeredSuccess:1 } } };
const jsonResponse = (body, status=200) => new Response(JSON.stringify(body), { status, headers:{'Content-Type':'application/json'} });

test('HMAC header follows SOLAPI date + salt signing rule', () => {
  const date='2026-11-05T00:00:00.000Z', salt='abcdef1234567890';
  const expected=createHmac('sha256','test-secret').update(date+salt).digest('hex');
  assert.equal(solapiAuthHeader('test-key','test-secret',date,salt),`HMAC-SHA256 apiKey=test-key, date=${date}, salt=${salt}, signature=${expected}`);
});
test('SMS text contains minimum consultation details, with input line breaks removed', () => {
  const text=formatConsultationSms(lead);
  assert.match(text,/프리다이빙 1\+2레벨/);
  assert.match(text,/고객: 가상 고객/);
  assert.match(text,/연락 희망: 저녁/);
  assert.match(text,/https:\/\/www\.bluepeace\.co\.kr\/admin/);
  assert.doesNotMatch(text,/010|문의사항|광고/);
});
test('demo and missing configuration cannot call SOLAPI', async () => {
  let count=0;
  const fetchImpl=async()=>{count++;return jsonResponse(fakeResult)};
  assert.equal((await sendSolapiConsultationSms(lead,{env:{...env,BLUEPEACE_PUBLIC_DEMO:'true'},fetchImpl})).status,'skipped');
  assert.equal((await sendSolapiConsultationSms(lead,{env:{...env,SOLAPI_ADMIN_PHONE:''},fetchImpl})).status,'skipped');
  assert.equal((await sendSolapiConsultationSms(lead,{env:{...env,SOLAPI_ENABLED:'false'},fetchImpl})).status,'skipped');
  assert.equal(count,0);
});
test('accepted response sends exactly one LMS to the admin, not the customer', async () => {
  let count=0;
  const fetchImpl=async(url,options)=>{
    count++;
    assert.equal(url,'https://api.solapi.com/messages/v4/send-many/detail');
    assert.match(options.headers.Authorization,/^HMAC-SHA256 apiKey=test-key/);
    const data=JSON.parse(options.body);
    assert.equal(data.messages.length,1);
    assert.equal(data.messages[0].to,'01099998888');
    assert.equal(data.messages[0].from,'01011112222');
    assert.equal(data.messages[0].type,'LMS');
    assert.equal(data.strict,true);
    return jsonResponse(fakeResult);
  };
  assert.deepEqual(await sendSolapiConsultationSms(lead,{env,fetchImpl}),{status:'sent',messageId:'M4VFAKE',groupId:'G4VFAKE'});
  assert.equal(count,1);
});
test('definite registration failures can be retried; transport and server ambiguity cannot', async () => {
  const rejected={...fakeResult,failedMessageList:[{ statusCode:'3040' }],messageList:[],groupInfo:{count:{registeredSuccess:0}}};
  assert.equal((await sendSolapiConsultationSms(lead,{env,fetchImpl:async()=>jsonResponse(rejected)})).status,'failed');
  assert.equal((await sendSolapiConsultationSms(lead,{env,fetchImpl:async()=>jsonResponse({},400)})).status,'failed');
  assert.equal((await sendSolapiConsultationSms(lead,{env,fetchImpl:async()=>jsonResponse({},500)})).status,'unknown');
  assert.equal((await sendSolapiConsultationSms(lead,{env,fetchImpl:async()=>{throw Error('timeout')}})).status,'unknown');
  assert.equal((await sendSolapiConsultationSms(lead,{env,fetchImpl:async()=>jsonResponse({})})).status,'unknown');
});
