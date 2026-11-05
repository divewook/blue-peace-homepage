import { createHmac, randomBytes } from 'node:crypto';

const endpoint = 'https://api.solapi.com/messages/v4/send-many/detail';
const phonePattern = /^0\d{8,11}$/;
export const contactWindowText = { morning: '오전', afternoon: '오후', evening: '저녁', anytime: '언제든 가능' };

function cleanLine(value, maxLength) {
  return String(value || '').replace(/[\x00-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}
export function formatConsultationSms({ name, course, contactWindow }) {
  const safeName = cleanLine(name, 100) || '기록 없음';
  const safeCourse = cleanLine(course, 120) || '상담 후 결정';
  return `[블루피스 신규 상담]\n\n신규 교육 상담이 접수되었습니다.\n\n교육과정: ${safeCourse}\n고객: ${safeName}\n연락 희망: ${contactWindowText[contactWindow] || '미선택'}\n\n상세 내용은 관리자 페이지에서 확인하세요.\nhttps://www.bluepeace.co.kr/admin`;
}
export function solapiAuthHeader(apiKey, apiSecret, date = new Date().toISOString(), salt = randomBytes(16).toString('hex')) {
  const signature = createHmac('sha256', apiSecret).update(date + salt).digest('hex');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}
function configured(env) {
  if (env.BLUEPEACE_PUBLIC_DEMO === 'true' || env.SOLAPI_ENABLED !== 'true') return null;
  const to = String(env.SOLAPI_ADMIN_PHONE || '').replace(/\D/g, '');
  const from = String(env.SOLAPI_SENDER_PHONE || '').replace(/\D/g, '');
  if (!env.SOLAPI_API_KEY || !env.SOLAPI_API_SECRET || !phonePattern.test(to) || !phonePattern.test(from)) return null;
  return { apiKey: env.SOLAPI_API_KEY, apiSecret: env.SOLAPI_API_SECRET, to, from };
}

// "sent" here means accepted by SOLAPI, not delivered to the handset.
// Unknown transport/server errors are never automatically retried: the request
// might have been accepted even though the response was lost.
export async function sendSolapiConsultationSms(consultation, { env = process.env, fetchImpl = fetch } = {}) {
  const config = configured(env);
  if (!config) return { status: 'skipped', errorCode: 'provider_not_configured' };
  const message = { to: config.to, from: config.from, type: 'LMS', text: formatConsultationSms(consultation), subject: '블루피스 신규 상담' };
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST', headers: {
        Authorization: solapiAuthHeader(config.apiKey, config.apiSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: [message], strict: true, allowDuplicates: false, showMessageList: true }),
      signal: AbortSignal.timeout(8_000),
    });
    // Do not log provider bodies. Some errors repeat recipient and text.
    if (!response.ok) return { status: response.status >= 500 ? 'unknown' : 'failed', errorCode: `provider_http_${response.status}` };
    const result = await response.json().catch(() => null);
    if (!result || !Array.isArray(result.messageList) || !Array.isArray(result.failedMessageList)) return { status: 'unknown', errorCode: 'invalid_provider_response' };
    if (result.failedMessageList.length) return { status: 'failed', errorCode: 'provider_registration_failed' };
    const accepted = result.messageList[0];
    if (result.messageList.length !== 1 || !accepted?.messageId || accepted.statusCode !== '2000' || result.groupInfo?.count?.registeredSuccess !== 1) {
      return { status: 'unknown', errorCode: 'provider_acceptance_unclear' };
    }
    return { status: 'sent', messageId: String(accepted.messageId).slice(0, 100), groupId: String(result.groupInfo.groupId || '').slice(0, 100) || null };
  } catch { return { status: 'unknown', errorCode: 'provider_response_unknown' }; }
}
