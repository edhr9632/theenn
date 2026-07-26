export type NewsSubCategory = {
  id: string;
  name: string;
  slug: string;
};

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: NewsSubCategory[];
};

export const CATEGORIES_STORAGE_KEY = "enn_admin_categories";

export const DEFAULT_NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: "cat-daily",
    name: "Daily News",
    slug: "daily-news",
    description: "Day-to-day education coverage",
    subcategories: [
      { id: "sub-policy", name: "Policy", slug: "policy" },
      { id: "sub-schools", name: "Schools", slug: "schools" },
      { id: "sub-higher-ed", name: "Higher Ed", slug: "higher-ed" },
    ],
  },
  {
    id: "cat-trending",
    name: "Trending",
    slug: "trending",
    description: "Stories gaining momentum",
    subcategories: [
      { id: "sub-viral", name: "Viral Stories", slug: "viral-stories" },
      { id: "sub-campus", name: "Campus", slug: "campus" },
    ],
  },
  {
    id: "cat-press",
    name: "Press Release",
    slug: "press-release",
    description: "Official announcements",
    subcategories: [
      { id: "sub-announcements", name: "Announcements", slug: "announcements" },
      { id: "sub-partnerships", name: "Partnerships", slug: "partnerships" },
    ],
  },
  {
    id: "cat-edtech",
    name: "EdTech",
    slug: "edtech",
    description: "Technology in education",
    subcategories: [
      { id: "sub-ai", name: "AI in Classrooms", slug: "ai-in-classrooms" },
      { id: "sub-tools", name: "Learning Tools", slug: "learning-tools" },
    ],
  },
  {
    id: "cat-events",
    name: "Events & Summits",
    slug: "events-summits",
    description: "Conferences and educator summits",
    subcategories: [
      { id: "sub-north", name: "North Summit", slug: "north-summit" },
      { id: "sub-south", name: "South Summit", slug: "south-summit" },
      { id: "sub-national", name: "National Conference", slug: "national-conference" },
    ],
  },
];

export function slugifyCategory(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function readCategories(): NewsCategory[] {
  if (typeof window === "undefined") return DEFAULT_NEWS_CATEGORIES;
  try {
    const raw = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return DEFAULT_NEWS_CATEGORIES;
    const parsed = JSON.parse(raw) as NewsCategory[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_NEWS_CATEGORIES;
    return parsed;
  } catch {
    return DEFAULT_NEWS_CATEGORIES;
  }
}

export function writeCategories(categories: NewsCategory[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
}
