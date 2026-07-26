import { weeklyIssues, type WeeklyIssue } from "@/lib/weeklyIssues";

export type WeeklyCity = {
  id: string;
  name: string;
  slug: string;
};

export type AdminWeeklyIssue = WeeklyIssue & {
  cityId: string;
  cityName: string;
};

export const WEEKLY_CITIES_KEY = "enn_admin_weekly_cities";
export const WEEKLY_ISSUES_KEY = "enn_admin_weekly_issues";

export const DEFAULT_WEEKLY_CITIES: WeeklyCity[] = [
  { id: "city-bengaluru", name: "Bengaluru", slug: "bengaluru" },
  { id: "city-mumbai", name: "Mumbai", slug: "mumbai" },
  { id: "city-delhi", name: "Delhi NCR", slug: "delhi-ncr" },
  { id: "city-chennai", name: "Chennai", slug: "chennai" },
  { id: "city-hyderabad", name: "Hyderabad", slug: "hyderabad" },
  { id: "city-pune", name: "Pune", slug: "pune" },
];

function seedIssues(): AdminWeeklyIssue[] {
  return weeklyIssues.map((issue) => ({
    ...issue,
    cityId: "city-bengaluru",
    cityName: "Bengaluru",
    title: issue.title.includes("Bengaluru") ? issue.title : `Weekly Bengaluru News`,
  }));
}

export function slugifyWeekly(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function createWeeklyId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function readWeeklyCities(): WeeklyCity[] {
  if (typeof window === "undefined") return DEFAULT_WEEKLY_CITIES;
  try {
    const raw = window.localStorage.getItem(WEEKLY_CITIES_KEY);
    if (!raw) return DEFAULT_WEEKLY_CITIES;
    const parsed = JSON.parse(raw) as WeeklyCity[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_WEEKLY_CITIES;
  } catch {
    return DEFAULT_WEEKLY_CITIES;
  }
}

export function writeWeeklyCities(cities: WeeklyCity[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEEKLY_CITIES_KEY, JSON.stringify(cities));
}

export function readWeeklyIssues(): AdminWeeklyIssue[] {
  if (typeof window === "undefined") return seedIssues();
  try {
    const raw = window.localStorage.getItem(WEEKLY_ISSUES_KEY);
    if (!raw) return seedIssues();
    const parsed = JSON.parse(raw) as AdminWeeklyIssue[];
    return Array.isArray(parsed) && parsed.length ? parsed : seedIssues();
  } catch {
    return seedIssues();
  }
}

export function writeWeeklyIssues(issues: AdminWeeklyIssue[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEEKLY_ISSUES_KEY, JSON.stringify(issues));
}

export function getIssuesForCity(cityId: string, issues?: AdminWeeklyIssue[]) {
  const list = issues ?? readWeeklyIssues();
  return list.filter((issue) => issue.cityId === cityId);
}
