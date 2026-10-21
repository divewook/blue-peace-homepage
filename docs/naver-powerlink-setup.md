# 네이버 파워링크 연결 준비

현재 홈페이지는 상담 신청과 담당 강사 매칭 서비스다. `customers`의 고유 `request_key`로 같은 신청의 재시도를 구분하며, 새 신청 저장(HTTP 201)과 강사 매칭 상태를 별개로 다룬다.

## 광고 연결 주소

- 프리다이빙: `https://www.bluepeace.co.kr/inquiry?course=freediving`
- 스쿠버다이빙: `https://www.bluepeace.co.kr/inquiry?course=scuba`

두 주소 모두 교육 분야만 미리 선택한다. 세부 과정과 풀장·요일·회차는 고객이 고른다. 네이버 광고 URL에는 캠페인에서 **자동 추적 URL 파라미터**를 켜서 `n_keyword`(등록 키워드), `n_query`(실제 검색어), `n_ad_group`, `n_ad`를 전달한다. UTM 링크도 수집한다. 제공되지 않은 값은 추정하지 않는다.

## 전환 추적 연결 전 필요한 작업

1. 네이버 광고주센터에 `www.bluepeace.co.kr` 비즈채널을 등록하고 노출 가능 상태를 확인한다.
2. 광고주센터의 전환 추적 관리에서 새 도메인으로 전환 추적을 신청한다. 발급된 **새 사이트의 네이버 공통키(na_account_id)** 와 설치 안내 메일을 확인한다. 기존 사이트 키를 복사하지 않는다.
3. 공식 `wcs.trans` 설치 안내에 맞춰 공통 태그의 페이지뷰, 쿠키 도메인, 선택 분석 동의 처리와 `lead` 전환을 함께 검수한다. 현재 코드의 전환 호출 지점은 신청 저장 성공 응답에만 연결돼 있지만, 공통 태그의 방문 시점 설치는 아직 완료되지 않았다. 식별키만 설정해 전환 추적이 완료됐다고 판단하지 않는다.
4. 공식 설치 검수와 개인정보 안내 확인 후 `NEXT_PUBLIC_NAVER_WCS_ACCOUNT_ID`에 발급값을 설정하고 `NEXT_PUBLIC_NAVER_WCS_ENABLED=true`로 활성화한다. 활성화 전에는 네이버 스크립트를 불러오거나 전환을 보내지 않는다.

브라우저 스크립트가 차단되어도 신청·매칭 API는 영향을 받지 않는다. 외부 전환 도구에는 이름, 전화번호, 상담 메모, 고객 ID를 넣지 않는다. 네이버 전환 유형은 상담 신청 완료를 뜻하는 `lead`이며 결제나 예약 확정이 아니다.

공식 자료: [자동 추적 URL 파라미터](https://ads.naver.com/help/faq/1335), [전환 추적 신청](https://ads.naver.com/help/faq/1473), [wcs.trans 설치 가이드](https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/).
