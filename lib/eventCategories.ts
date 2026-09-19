export const EVENT_CATEGORIES_BY_YEAR: Record<number, string[]> = {
  2025: [
    "North & Maharashtra Educators' Summit & Awards 2025",
    "Karnataka Educators' Summit & Awards 2025",
    "13th National K-12 Leadership Conference 2025",
  ],
  2026: [
    "North Educators' Summit & Awards 2026",
    "Maharashtra Educators' Summit & Awards 2026",
    "South India Educators' Summit 2026",
    "14th National Conference on K-12 Leadership 2026",
  ],
};

export const EVENT_YEAR_OPTIONS = [2026, 2025] as const;

/** All categories across years. Prefer getEventCategoriesForYear(). */
export const EVENT_CATEGORY_OPTIONS = Object.values(EVENT_CATEGORIES_BY_YEAR).flat();

export function getEventCategoriesForYear(year: string | number): string[] {
  const numeric = typeof year === "number" ? year : Number(year);
  return EVENT_CATEGORIES_BY_YEAR[numeric] ?? EVENT_CATEGORIES_BY_YEAR[2026] ?? [];
}

export function getDefaultEventCategory(year: string | number): string {
  return getEventCategoriesForYear(year)[0] ?? "";
}
