/** @deprecated Weekly data is stored in Postgres — use /api/weekly. localStorage helpers kept for one-time migration only. */
export {
  createWeeklyId,
  DEFAULT_WEEKLY_CITIES,
  getIssuesForCity,
  slugifyWeekly,
  type AdminWeeklyIssue,
  type WeeklyCity,
} from "@/lib/weeklyTypes";

export const WEEKLY_CITIES_KEY = "enn_admin_weekly_cities";
export const WEEKLY_ISSUES_KEY = "enn_admin_weekly_issues";

import type { AdminWeeklyIssue, WeeklyCity } from "@/lib/weeklyTypes";

export function readWeeklyCities(): WeeklyCity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WEEKLY_CITIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WeeklyCity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeWeeklyCities(cities: WeeklyCity[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEEKLY_CITIES_KEY, JSON.stringify(cities));
}

export function readWeeklyIssues(): AdminWeeklyIssue[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WEEKLY_ISSUES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdminWeeklyIssue[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeWeeklyIssues(issues: AdminWeeklyIssue[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEEKLY_ISSUES_KEY, JSON.stringify(issues));
}
