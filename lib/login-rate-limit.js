import { createHmac } from "node:crypto";
import { createAdminSupabase } from "./admin-supabase";

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function identifierHash(request, scope, username) {
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  if (!secret) throw new Error("세션 보안 키가 설정되지 않았습니다.");
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHmac("sha256", secret)
    .update(`${scope}:${username.trim().toLowerCase()}:${forwardedFor}`)
    .digest("hex");
}

export async function checkLoginAllowed(request, scope, username) {
  const key = identifierHash(request, scope, username);
  const { data, error } = await createAdminSupabase()
    .from("auth_login_attempts")
    .select("attempts,window_started_at,blocked_until")
    .eq("identifier_hash", key)
    .maybeSingle();
  if (error) throw error;
  const now = Date.now();
  return {
    key,
    allowed: !data?.blocked_until || new Date(data.blocked_until).getTime() <= now,
    retryAfterSeconds: data?.blocked_until
      ? Math.max(1, Math.ceil((new Date(data.blocked_until).getTime() - now) / 1000))
      : 0,
    state: data,
  };
}

export async function recordLoginFailure(key, state) {
  const now = Date.now();
  const windowStarted = state?.window_started_at ? new Date(state.window_started_at).getTime() : 0;
  const withinWindow = now - windowStarted < WINDOW_MS;
  const attempts = withinWindow ? Number(state?.attempts || 0) + 1 : 1;
  const blockedUntil = attempts >= MAX_ATTEMPTS ? new Date(now + BLOCK_MS).toISOString() : null;
  const { error } = await createAdminSupabase().from("auth_login_attempts").upsert({
    identifier_hash: key,
    attempts,
    window_started_at: withinWindow ? state.window_started_at : new Date(now).toISOString(),
    blocked_until: blockedUntil,
    updated_at: new Date(now).toISOString(),
  });
  if (error) throw error;
}

export async function clearLoginFailures(key) {
  const { error } = await createAdminSupabase()
    .from("auth_login_attempts")
    .delete()
    .eq("identifier_hash", key);
  if (error) throw error;
}
