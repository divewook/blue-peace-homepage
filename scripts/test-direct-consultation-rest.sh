#!/usr/bin/env bash
# Disposable local PostgREST integration. No hosted Supabase project or credentials.
set -euo pipefail
cd "$(dirname "$0")/.."
test_network="bluepeace-rest-net-$$"
test_pg="bluepeace-rest-pg-$$"
test_rest="bluepeace-rest-api-$$"
cleanup() {
  docker stop "$test_rest" "$test_pg" >/dev/null 2>&1 || true
  docker network rm "$test_network" >/dev/null 2>&1 || true
}
trap cleanup EXIT
docker network create "$test_network" >/dev/null
docker run --rm -d --network "$test_network" --name "$test_pg" --network-alias pg \
  -e POSTGRES_PASSWORD=local-only -e POSTGRES_DB=bluepeace_test postgres:17-alpine >/dev/null
for attempt in {1..30}; do
  if docker exec "$test_pg" psql -U postgres -d bluepeace_test -Atqc 'select 1' >/dev/null 2>&1; then break; fi
  sleep 0.25
done
sleep 2
for sql_file in \
  tests/direct-consultation-bootstrap.sql \
  supabase/migrations/20261015142812_create_customer_matches.sql \
  supabase/migrations/20261015144246_add_customer_matching_and_attribution_details.sql \
  supabase/migrations/20261016065539_add_pool_specific_availability_and_youth_details.sql \
  supabase/migrations/20261017081306_add_safe_customer_request_flow.sql \
  supabase/migrations/20261017090000_add_instructor_day_slots.sql \
  supabase/migrations/20261017120000_add_customer_consultations_and_lessons.sql \
  supabase/migrations/20261018100000_stabilize_first_lesson_workflow.sql \
  supabase/migrations/20261020142741_manual_assignment_delivery.sql \
  supabase/migrations/20261020143820_serialize_delivery_retries.sql \
  supabase/migrations/20261021153011_add_naver_ad_attribution.sql \
  supabase/migrations/20261108054503_direct_consultations.sql; do
  docker exec -i "$test_pg" psql -U postgres -d bluepeace_test -v ON_ERROR_STOP=1 >/dev/null < "$sql_file"
done
docker exec -i "$test_pg" psql -U postgres -d bluepeace_test -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
create role authenticator login password 'local-only';
grant anon, authenticated, service_role to authenticator;
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
insert into public.instructors(id,name,is_approved,course_levels)
values('11111111-1111-4111-8111-111111111111','가상 강사',true,'{"프리다이빙":"1레벨 (프리다이버)"}');
SQL
docker run --rm -d --network "$test_network" --name "$test_rest" \
  -p 127.0.0.1::3000 \
  -e PGRST_DB_URI='postgres://authenticator:local-only@pg:5432/bluepeace_test' \
  -e PGRST_DB_SCHEMAS=public -e PGRST_DB_ANON_ROLE=anon \
  -e PGRST_JWT_SECRET='local-only-jwt-secret-at-least-32-bytes-long' \
  public.ecr.aws/supabase/postgrest:v16.5 >/dev/null
rest_port="$(docker port "$test_rest" 3000/tcp | sed -n 's/.*://p' | head -1)"
for attempt in {1..30}; do
  if curl -fsS "http://127.0.0.1:${rest_port}/" >/dev/null 2>&1; then break; fi
  sleep 0.25
done
BLUEPEACE_LOCAL_REST_URL="http://127.0.0.1:${rest_port}" python3 - <<'PY'
import base64, hashlib, hmac, json, os, urllib.request, urllib.error
base=os.environ['BLUEPEACE_LOCAL_REST_URL']
secret=b'local-only-jwt-secret-at-least-32-bytes-long'
def jwt(role):
 def enc(v): return base64.urlsafe_b64encode(json.dumps(v,separators=(',',':')).encode()).rstrip(b'=')
 data=enc({'alg':'HS256','typ':'JWT'})+b'.'+enc({'role':role})
 return (data+b'.'+base64.urlsafe_b64encode(hmac.new(secret,data,hashlib.sha256).digest()).rstrip(b'=')).decode()
def request(path,method='GET',payload=None,token=None):
 headers={'Content-Type':'application/json','Prefer':'return=representation'}
 if token: headers['Authorization']='Bearer '+token
 data=json.dumps(payload).encode() if payload is not None else None
 req=urllib.request.Request(base+path,data=data,headers=headers,method=method)
 try:
  with urllib.request.urlopen(req,timeout=5) as res: return res.status,json.loads(res.read() or b'null')
 except urllib.error.HTTPError as err: return err.code,json.loads(err.read() or b'null')
service=jwt('service_role')
assert request('/customers')[0] in (401,403)
assert request('/customers',token=jwt('authenticated'))[0] in (401,403)
assert request('/customer_consultation_events')[0] in (401,403)
assert request('/customer_direct_alerts')[0] in (401,403)
blocked_rpc={'p_customer':'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p_expected_revision':0,'p_action':'status','p_status':'attempted','p_instructor':None,'p_request_key':'00000000-0000-4000-8000-000000000100','p_actor_session':'0123456789abcdef01234567'}
assert request('/rpc/save_customer_direct_consultation',method='POST',payload=blocked_rpc,token=jwt('anon'))[0] in (401,403,404)
assert request('/customers',token=service)[0]==200
lead={'name':'가상 고객','phone':'010-0000-0000','course':'프리다이빙 1레벨','pool':'상담 후 협의','time_slot':'상담 후 협의','matched_instructor':'배정 대기','request_key':'00000000-0000-4000-8000-000000000101','request_status':'pending_assignment','consultation_source':'direct','consultation_status':'new','schedule_mode':'flexible','schedule_alternatives':[]}
status,rows=request('/customers?select=id,consultation_revision',method='POST',payload=lead,token=service)
assert status==201,(status,rows)
customer_id=rows[0]['id'] if isinstance(rows,list) else rows['id']
assert request('/customers',method='POST',payload=lead,token=service)[0]==409
status,jobs=request('/customer_direct_alerts?select=customer_id,status,attempts',token=service)
assert status==200 and len(jobs)==1 and jobs[0]['status']=='pending',(status,jobs)
status,claimed=request('/rpc/claim_direct_consultation_alert',method='POST',payload={'p_customer':customer_id},token=service)
assert status==200 and claimed is True,(status,claimed)
status,claimed=request('/rpc/claim_direct_consultation_alert',method='POST',payload={'p_customer':customer_id},token=service)
assert status==200 and claimed is False,(status,claimed)
args={'p_customer':customer_id,'p_expected_revision':0,'p_action':'status','p_status':'attempted','p_instructor':None,'p_request_key':'00000000-0000-4000-8000-000000000102','p_actor_session':'0123456789abcdef01234567'}
assert request('/rpc/save_customer_direct_consultation',method='POST',payload=args,token=service)[0]==200
assign={**args,'p_expected_revision':1,'p_action':'assign','p_status':None,'p_instructor':'11111111-1111-4111-8111-111111111111','p_request_key':'00000000-0000-4000-8000-000000000103'}
status,row=request('/rpc/save_customer_direct_consultation',method='POST',payload=assign,token=service)
assert status==200,(status,row)
assert row['matched_instructor_id']==assign['p_instructor']
assert request('/rpc/save_customer_direct_consultation',method='POST',payload=assign,token=service)[0]==200
status,events=request('/customer_consultation_events?select=action',token=service)
assert status==200 and len(events)==2,(status,events)
print('PASS isolated PostgREST v16.5: RLS/grants, insert, duplicate, status, assignment, idempotency')
PY
