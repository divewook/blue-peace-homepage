# 2차 상담 개편: 배포 및 검증 메모

## 공개 미리보기

- 고정 주소: `https://bluepeace-public-demo.vercel.app/TEST`
- 검수 자료: `https://bluepeace-public-demo.vercel.app/TEST/review`. PC·모바일 화면과 로컬 가상 데이터로 촬영한 관리자 화면 이미지가 있다. `scripts/capture-review.mjs`로 화면을 다시 만들 수 있다.
- 전용 Vercel 프로젝트: `bluepeace-public-demo` (`prj_gy3KGFjLBBsICusfHO95HUoIeUXM`). 운영 프로젝트 `blue-peace-homepage`와 별도다.
- 데모 프로젝트에는 운영 DB URL·서비스 키·관리자 비밀·알림/광고 키를 넣지 않는다. 현재 URL은 `example.supabase.co`, 공개 키는 자리표시자다.
- `BLUEPEACE_PUBLIC_DEMO=true`, `NEXT_PUBLIC_BLUEPEACE_PUBLIC_DEMO=true`가 필수다. 프로젝트 설정의 Ignored Build Step은 `codex/homepage-refresh-20261104` 브랜치 외 자동 빌드를 건너뛴다. 새 브랜치로 옮길 때 이 조건을 먼저 변경한다.
- `proxy.ts`는 데모에서 `/`, `/TEST`와 그 상담·정책 화면, 정적 이미지와 Next 자산만 허용한다. 모든 API, 관리자·강사·운영 문의 경로는 404다. `/`는 `/TEST`로 이동한다. 응답 헤더와 테스트 레이아웃에 `noindex`가 있다.
- 공개 상담 폼은 브라우저 안에서만 완료 화면을 보여준다. 입력한 개인정보는 전송·저장하지 않는다. 실제 관리 업무 검증에는 이 공개 데모를 사용하지 않는다.
- 새 코드 확인 시 해당 브랜치를 검증한 후 **데모 프로젝트만** 최신 커밋으로 배포한다. 데모 프로젝트의 고정 프로젝트 별칭을 확인한다. 운영 프로젝트나 `www.bluepeace.co.kr`에 프로모션하지 않는다.

## 운영 전환 전 필요 작업

1. 운영자 승인 후 운영 DB 스키마 백업과 migration 적용 계획을 확인한다. `20261104040000_direct_consultations.sql`은 기존 행의 상태나 배정을 바꾸지 않는 추가 변경이다. 운영 DB에는 아직 적용하지 않았다.
2. 격리된 PostgreSQL과 PostgREST에서 신규 접수, 중복 키, 상태·메모 수정, 강사 배정·권한, 기존 신청 호환을 검증했다. 실제 Supabase 운영 설정을 이용한 통합 검증은 배포 전 별도 수행한다. 자세한 결과는 `docs/second-stage-release-readiness.md`에 있다.
3. 운영 배포는 migration 성공 및 배포 전 점검 후에만 한다. 구버전 코드로 롤백하면 새 상담 필드는 DB에 남지만 구버전 화면은 이를 표시하지 못한다. 구버전 상담 화면은 자동 매칭을 다시 사용할 수 있으므로 운영 롤백만으로 새 정책이 보존되지는 않는다.
4. 신규 `/api/consultations`는 강사를 자동 배정하지 않는다. 기존 `/api/matches`와 과거 데이터는 보존한다. 새 고객 신청에는 `consultation_source='direct'`, 별도 상담 상태를 기록한다. 관리자 배정 시 기존 강사 업무 행을 만들고 배정 이력을 유지한다.
5. 기존 관리자 계정은 공유 계정이므로 이벤트의 세션 지문은 변경 세션을 구분할 뿐 실제 사람을 증명하지 못한다.

## 알림 상태

기존 카카오 알림톡 어댑터는 유지된다. 현재 운영 프로젝트에는 발송 업체 URL·키·템플릿 환경 변수가 없어 실제 자동 발송은 설정되지 않았다. 일반 카카오톡 개인 계정으로 웹사이트가 자동 메시지를 보내는 기능은 없다. 관리자는 화면의 새로고침 버튼이나 화면이 열려 있을 때의 60초 갱신으로 신규 상담을 확인할 수 있다.
