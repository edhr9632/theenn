export const siteConfig = {
  name: "Education News Network",
  tagline: "Independent journalism for a connected world.",
};

export type NewsArticle = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  date: string;
  image: string;
  imageAlt: string;
  video?: boolean;
};

/** Public news comes from PostgreSQL via newsDb — no static seed articles. */
export const newsArticles: NewsArticle[] = [];

export type PanelDiscussion = {
  episode: string;
  duration: string;
  topic: string;
  title: string;
  speakers: string;
  image: string;
  youtube: string;
};

/** Panels come from PostgreSQL via panelsDb. */
export const panelDiscussions: PanelDiscussion[] = [];

export const categories: { name: string; count: number; href?: string }[] = [
  { name: "Daily News", count: 0, href: "/news" },
  { name: "Trending", count: 0, href: "/trending-news" },
  { name: "Press Release", count: 0, href: "/press-release" },
  { name: "Weekly News", count: 0, href: "/weekly-news" },
];

export type EventEdition = {
  id: string;
  title: string;
  /** Filter label shown in Category dropdown — unique per year */
  category: string;
  year: 2025 | 2026;
  date: string;
  location: string;
};

export type SpeakerProfile = {
  name: string;
  role: string;
  image: string;
  eventId: EventEdition["id"];
  category: string;
  year: EventEdition["year"];
  youtube: string;
};

export type SponsorProfile = {
  name: string;
  tier: string;
  image: string;
  eventId: EventEdition["id"];
  category: string;
  year: EventEdition["year"];
  youtube: string;
};

/** Categories for each year — filled from admin/backend when available. */
export const eventCategoriesByYear: Record<number, string[]> = {
  2026: [],
  2025: [],
};

export const eventEditions: EventEdition[] = [];

export function getEventYears(): number[] {
  return Array.from(new Set(eventEditions.map((e) => e.year))).sort((a, b) => b - a);
}

export function getCategoriesForYear(year: string | number): string[] {
  if (year === "All" || year === "") {
    return Array.from(new Set(eventEditions.map((e) => e.category)));
  }
  const y = Number(year);
  return eventCategoriesByYear[y] ?? eventEditions.filter((e) => e.year === y).map((e) => e.category);
}

export const speakers: SpeakerProfile[] = [];

export const sponsors: SponsorProfile[] = [];

export const events: {
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  location: string;
  image: string;
}[] = [];
