import "server-only";
import { createHash } from "node:crypto";
import { createAdminSupabase } from "./admin-supabase";

const EVENT_CONFIG = {
  match_requested: "KAKAO_ALIMTALK_MATCH_TEMPLATE_CODE",
  instructor_approved: "KAKAO_ALIMTALK_APPROVAL_TEMPLATE_CODE",
};

function digits(value) {
  return typeof value === "string" ? value.replace(/\D/g, "").slice(0, 20) : "";
}

function recipientHash(phone) {
  return createHash("sha256").update(phone).digest("hex");
}

async function recordDelivery(delivery) {
  const { error } = await createAdminSupabase().from("notification_deliveries").insert(delivery);
  if (error) console.error("notification_delivery_record_failed", error.code || "database_error");
}

export async function sendKakaoAlimtalk({ eventType, recipientRole, phone, variables }) {
  const recipient = digits(phone);
  const endpoint = process.env.KAKAO_ALIMTALK_API_URL;
  const apiKey = process.env.KAKAO_ALIMTALK_API_KEY;
  const senderKey = process.env.KAKAO_ALIMTALK_SENDER_KEY;
  const templateCode = process.env[EVENT_CONFIG[eventType]];
  const base = {
    event_type: eventType,
    recipient_role: recipientRole,
    recipient_hash: recipient ? recipientHash(recipient) : null,
    provider: "kakao_alimtalk",
  };

  if (!recipient || !endpoint || !apiKey || !senderKey || !templateCode) {
    await recordDelivery({ ...base, status: "skipped", error_code: "provider_not_configured" });
    return { status: "skipped" };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ senderKey, templateCode, recipient, variables }),
      signal: AbortSignal.timeout(8_000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`provider_http_${response.status}`);
    const messageId = String(result.messageId || result.id || "").slice(0, 200) || null;
    await recordDelivery({ ...base, status: "sent", provider_message_id: messageId });
    return { status: "sent", messageId };
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 200) : "provider_error";
    await recordDelivery({ ...base, status: "failed", error_code: code });
    return { status: "failed" };
  }
}
