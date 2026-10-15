import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "bluepeace_admin_session";
const maxAge = 60 * 60 * 8;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function signature(payload) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function createAdminSession() {
  const payload = `${Date.now()}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}

export async function hasAdminSession() {
  if (!sessionSecret()) return false;
  const value = (await cookies()).get(adminCookieName)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(signature(payload), "hex");
  const actual = Buffer.from(parts[2], "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  const issuedAt = Number(parts[0]);
  return Number.isFinite(issuedAt) && issuedAt <= Date.now() && Date.now() - issuedAt < maxAge * 1000;
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge,
};

