#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
test_container="bluepeace-direct-test-$$"
cleanup() { docker stop "$test_container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --rm -d --network none --name "$test_container" \
  -e POSTGRES_PASSWORD=local-only -e POSTGRES_DB=bluepeace_test postgres:17-alpine >/dev/null
for attempt in {1..20}; do
  if docker exec "$test_container" pg_isready -U postgres -d bluepeace_test >/dev/null 2>&1; then break; fi
  sleep 0.25
done

files=(
  tests/direct-consultation-bootstrap.sql
  supabase/migrations/20261015142812_create_customer_matches.sql
  supabase/migrations/20261015144246_add_customer_matching_and_attribution_details.sql
  supabase/migrations/20261016065539_add_pool_specific_availability_and_youth_details.sql
  supabase/migrations/20261017081306_add_safe_customer_request_flow.sql
  supabase/migrations/20261017090000_add_instructor_day_slots.sql
  supabase/migrations/20261017120000_add_customer_consultations_and_lessons.sql
  supabase/migrations/20261018100000_stabilize_first_lesson_workflow.sql
  supabase/migrations/20261020142741_manual_assignment_delivery.sql
  supabase/migrations/20261020143820_serialize_delivery_retries.sql
  supabase/migrations/20261021153011_add_naver_ad_attribution.sql
  supabase/migrations/20261104040000_direct_consultations.sql
  tests/direct-consultation-integration.sql
)
for sql_file in "${files[@]}"; do
  docker exec -i "$test_container" psql -U postgres -d bluepeace_test -v ON_ERROR_STOP=1 \
    >/dev/null < "$sql_file"
  printf 'PASS %s\n' "$sql_file"
done
