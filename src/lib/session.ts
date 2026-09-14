import "server-only";
import { cookies } from "next/headers";
import type { User } from "@/types";

/**
 * A single signed-in identity. The environment is deterministic, so there is
 * one stable user unless a session cookie says otherwise.
 */
export const DEFAULT_USER: User = {
  id: "u-1",
  firstName: "Aarav",
  lastName: "Sharma",
  email: "aarav.sharma@example.in",
  avatar: null,
  joinedAt: "2023-04-11",
};

export const SESSION_COOKIE = "abnb_session";

export async function getCurrentUser(): Promise<User> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return DEFAULT_USER;
  try {
    return { ...DEFAULT_USER, ...(JSON.parse(raw) as Partial<User>) };
  } catch {
    return DEFAULT_USER;
  }
}

export async function getCurrentUserId(): Promise<string> {
  return (await getCurrentUser()).id;
}
