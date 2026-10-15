# 카카오 알림톡 서버 어댑터 계약

`KAKAO_ALIMTALK_API_URL`은 선택한 알림톡 공급사(Solapi, NHN Cloud, 비즈뿌리오 등)를 감싸는 서버 전용 어댑터 주소입니다. 블루피스 서버는 아래 형식으로 `POST` 요청을 보냅니다.

```json
{
  "senderKey": "카카오 채널 발신 프로필 키",
  "templateCode": "승인된 템플릿 코드",
  "recipient": "01012345678",
  "variables": {
    "customerName": "신청자명",
    "instructorName": "강사명",
    "course": "교육 과정",
    "pool": "희망 풀장",
    "schedule": "희망 일정"
  }
}
```

요청 헤더는 `Authorization: Bearer <KAKAO_ALIMTALK_API_KEY>`입니다. 어댑터 응답의 `messageId` 또는 `id`는 발송 이력에 저장됩니다.

## 이벤트와 템플릿

- `match_requested`: 강사와 관리자에게 신규 매칭 신청 알림
- `instructor_approved`: 승인된 강사에게 계정 승인 알림

알림 공급사 장애나 설정 누락은 회원가입, 승인, 매칭 저장을 실패시키지 않습니다. 발송 결과는 `notification_deliveries`에 전화번호 원문 없이 해시와 상태만 저장됩니다.
