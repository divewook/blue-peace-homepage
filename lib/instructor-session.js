import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const instructorCookieName = "bluepeace_instructor_session";
const maxAge = 60 * 60 * 8;

function sign(payload) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "")
    .update(`instructor:${payload}`)
    .digest("hex");
}

export function createInstructorSession(id) {
  const payload = `${id}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export async function getInstructorSessionId() {
  if (!process.env.ADMIN_SESSION_SECRET) return null;
  const value = (await cookies()).get(instructorCookieName)?.value;
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3 || !/^[0-9a-f-]{36}$/i.test(parts[0])) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const actual = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(sign(payload), "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  const issuedAt = Number(parts[1]);
  if (!Number.isFinite(issuedAt) || issuedAt > Date.now() || Date.now() - issuedAt > maxAge * 1000) return null;
  return parts[0];
}

export const instructorCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge,
};
