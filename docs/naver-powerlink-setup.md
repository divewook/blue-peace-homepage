# 네이버 검색광고 전환 추적

현재 홈페이지는 상담 신청과 담당 강사 매칭 서비스다. `customers`의 고유 `request_key`로 같은 신청의 재시도를 구분하며, 새 신청 저장(HTTP 201)과 강사 매칭 상태를 별개로 다룬다.

## 광고 연결 주소

- 프리다이빙: `https://www.bluepeace.co.kr/inquiry?course=freediving`
- 스쿠버다이빙: `https://www.bluepeace.co.kr/inquiry?course=scuba`

두 주소 모두 교육 분야만 미리 선택한다. 세부 과정과 풀장·요일·회차는 고객이 고른다. 네이버 광고 URL에는 캠페인에서 **자동 추적 URL 파라미터**를 켜서 `n_keyword`(등록 키워드), `n_query`(실제 검색어), `n_ad_group`, `n_ad`를 전달한다. UTM 링크도 수집한다. 제공되지 않은 값은 추정하지 않는다.

## 설치 상태와 동작

1. 네이버 광고주센터에 `www.bluepeace.co.kr` 비즈채널을 등록하고 노출 가능 상태를 확인한다.
2. 이 도메인용으로 발급된 네이버 공통키 `s_bfc8b6e814c`만 `NEXT_PUBLIC_NAVER_WCS_ACCOUNT_ID`로 설정한다. 기존 홈페이지나 스마트스토어 키는 사용하지 않는다. `NEXT_PUBLIC_NAVER_WCS_ENABLED=true`도 Production 환경에 설정한다.
3. 사용자가 방문 분석에 동의하면 `/`와 `/inquiry`에서 공통 스크립트를 한 번 불러오고 `wcs_add.wa`, `wcs.inflow('bluepeace.co.kr')`, `wcs_do()`로 방문을 기록한다. SPA 화면 이동마다 필요한 페이지뷰를 기록하며 `/TEST`, 강사·관리자 화면은 제외한다. 동의하지 않은 방문은 네이버에 보내지 않는다.
4. 상담 신청이 서버에서 **새로 저장된 HTTP 201** 응답에서만 `wcs.trans({ type: 'lead' })`를 호출한다. `request_key` 중복 응답(HTTP 200), 저장 오류, 입력 오류, 완료 화면 새로고침은 전환을 보내지 않는다. 동일 신청의 브라우저 재시도도 세션 저장소에서 막는다.
5. 광고주센터의 설치 검수 전, 동의 상태의 방문 페이지뷰와 격리된 상담 신청 전환을 확인한다. 운영 DB에 검사용 고객 신청을 만들지 않는다. 실제 광고주센터에서 집계되는지와 자가 설치 안내 메일의 세부 조건은 별도 확인이 필요하다.

브라우저 스크립트가 차단되어도 신청·매칭 API는 영향을 받지 않는다. 외부 전환 도구에는 이름, 전화번호, 상담 메모, 고객 ID를 넣지 않는다. 네이버 전환 유형은 상담 신청 완료를 뜻하는 `lead`이며 결제나 예약 확정이 아니다. 네이버 광고주센터에서 제공한 자가 설치 안내 메일 원문은 이 저장소에 없으므로 공식 공개 가이드와 대조했고, 메일 전용 지침은 운영자가 추가 확인해야 한다.

공식 자료: [자동 추적 URL 파라미터](https://ads.naver.com/help/faq/1335), [전환 추적 신청](https://ads.naver.com/help/faq/1473), [wcs.trans 설치 가이드](https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/).
