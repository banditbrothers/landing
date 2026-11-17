"use server";

import { checkAdminPassword, isAdminSession, setAdminSession } from "@/lib/admin-auth";

// ponytail: no rate limit, so ADMIN_PASSWORD must be long and random; add one if it ever has to be memorable
export const adminLogin = async (password: string) => {
  if (!checkAdminPassword(password)) return false;
  await setAdminSession();
  return true;
};

export const checkAdminSession = async () => isAdminSession();
