import { ADMIN_STORAGE_KEY } from "@/lib/admin";

const COOKIE_NAME = "enn_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = {
  email: string;
  at: number;
};

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminSession;
      if (parsed?.email) return parsed;
    }
  } catch {
    // fall through to cookie
  }

  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    if (match?.[1]) {
      const parsed = JSON.parse(decodeURIComponent(match[1])) as AdminSession;
      if (parsed?.email) return parsed;
    }
  } catch {
    // ignore
  }

  return null;
}

export function writeAdminSession(email: string): boolean {
  if (typeof window === "undefined") return false;

  const payload: AdminSession = { email, at: Date.now() };
  const serialized = JSON.stringify(payload);

  try {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, serialized);
  } catch {
    // continue — cookie may still work
  }

  try {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(serialized)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    return false;
  }

  return Boolean(readAdminSession());
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
  } catch {
    // ignore
  }

  try {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function isAdminAuthenticated(): boolean {
  return readAdminSession() !== null;
}
