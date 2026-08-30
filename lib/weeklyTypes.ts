export type WeeklyHighlight = {
  label: string;
  tone: "red" | "blue" | "purple" | "teal" | "ink";
};

export type WeeklyCity = {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
};

export type WeeklyIssue = {
  slug: string;
  dateLabel: string;
  weekday: string;
  title: string;
  tagline: string;
  coverImage: string;
  pdfUrl: string;
  highlights: WeeklyHighlight[];
  featured?: boolean;
};

export type AdminWeeklyIssue = WeeklyIssue & {
  cityId: string;
  cityName: string;
};

export type WeeklyAdminState = {
  cities: WeeklyCity[];
  issues: AdminWeeklyIssue[];
};

export type WeeklyCityInput = {
  name: string;
};

export type WeeklyIssueInput = {
  slug?: string;
  cityId: string;
  dateLabel: string;
  weekday: string;
  title: string;
  tagline?: string;
  coverImage: string;
  pdfUrl: string;
  highlights?: WeeklyHighlight[];
  featured?: boolean;
  sortOrder?: number;
};

export const DEFAULT_WEEKLY_CITIES: WeeklyCity[] = [
  { id: "city-bengaluru", name: "Bengaluru", slug: "bengaluru", sortOrder: 0 },
  { id: "city-mumbai", name: "Mumbai", slug: "mumbai", sortOrder: 1 },
  { id: "city-delhi", name: "Delhi NCR", slug: "delhi-ncr", sortOrder: 2 },
  { id: "city-chennai", name: "Chennai", slug: "chennai", sortOrder: 3 },
  { id: "city-hyderabad", name: "Hyderabad", slug: "hyderabad", sortOrder: 4 },
  { id: "city-pune", name: "Pune", slug: "pune", sortOrder: 5 },
];

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

export function getIssuesForCity(cityId: string, issues: AdminWeeklyIssue[]) {
  return issues.filter((issue) => issue.cityId === cityId);
}
