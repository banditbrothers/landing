import "server-only";
// Not "use server": requireAdmin must only be called from other server code.
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { getTimestamp } from "@/utils/timestamp";

const COOKIE = "admin_session";
const MAX_AGE = 30 * 24 * 60 * 60; // seconds

// Signed with the password itself, so changing ADMIN_PASSWORD logs every session out
const sign = (exp: string) => createHmac("sha256", process.env.ADMIN_PASSWORD!).update(exp).digest("hex");

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

export const checkAdminPassword = (password: string) =>
  !!process.env.ADMIN_PASSWORD && safeEqual(password, process.env.ADMIN_PASSWORD);

export const setAdminSession = async () => {
  const exp = String(getTimestamp() + MAX_AGE);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
};

export const isAdminSession = async () => {
  if (!process.env.ADMIN_PASSWORD) return false;
  const [exp, sig] = (await cookies()).get(COOKIE)?.value.split(".") ?? [];
  if (!exp || !sig || Number(exp) < getTimestamp()) return false;
  return safeEqual(sig, sign(exp));
};

/** First line of every admin-only server action. */
export const requireAdmin = async () => {
  if (!(await isAdminSession())) throw new Error("Unauthorized");
};
