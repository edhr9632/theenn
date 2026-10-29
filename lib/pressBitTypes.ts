export type PressBitSourceType = "youtube" | "upload";

export type PressBit = {
  id: string;
  slug: string;
  title: string;
  videoUrl: string;
  sourceType: PressBitSourceType;
  image: string;
  year: number;
  category: string;
  sortOrder: number;
  enabled: boolean;
};

export type PressBitInput = {
  title: string;
  videoUrl: string;
  sourceType?: PressBitSourceType;
  imageUrl?: string;
  year: number;
  category: string;
  sortOrder?: number;
  enabled?: boolean;
  slug?: string;
};

/** Basic kebab-case slug (for lookups / cleanup). */
export function slugifyPressBit(value: string, maxLength = 60) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

function cleanSlugPhrase(value: string) {
  return value
    .replace(/\s*[-–—|:·]+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEventYear(value: string) {
  const match = value.match(/\b(20\d{2})(?:-\d{2})?\b/);
  return match?.[1] ?? "";
}

/**
 * SEO slug = school/org name + event name.
 * e.g. "Campion School, Mumbai Award - Winner Interview | ... | Maharashtra Educators' Summit and Awards 2026-27"
 *   → "campion-school-mumbai-maharashtra-educators-summit-2026"
 */
export function buildPressBitSeoSlug(title: string, maxLength = 72) {
  const parts = title
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  const schoolRaw = parts[0] || title;
  const eventRaw = parts.length > 1 ? parts[parts.length - 1] : "";

  const school = cleanSlugPhrase(
    schoolRaw
      .replace(/\bawards?\b/gi, " ")
      .replace(/\bwinner(?:'s)?\b/gi, " ")
      .replace(/\binterview(?:s)?\b/gi, " ")
      .replace(/\bkeynote\b/gi, " ")
      .replace(/\bspeaker\b/gi, " ")
      .replace(/\bpanel\b/gi, " ")
      .replace(/\bsponsor\b/gi, " ")
      .replace(/\b20\d{2}(?:-\d{2})?\b/g, " "),
  );

  const eventYear = extractEventYear(eventRaw);
  const event = cleanSlugPhrase(
    eventRaw
      .replace(/\band\b/gi, " ")
      .replace(/\bawards?\b/gi, " ")
      .replace(/\b20\d{2}(?:-\d{2})?\b/g, " "),
  );

  const eventSlug = slugifyPressBit(event, 40);
  const eventPart = [eventSlug, eventYear].filter(Boolean).join("-");
  const schoolBudget = Math.max(18, maxLength - (eventPart ? eventPart.length + 1 : 0));
  let schoolSlug = slugifyPressBit(school || schoolRaw, schoolBudget);
  if (schoolSlug.length >= schoolBudget) {
    const cut = schoolSlug.lastIndexOf("-", schoolBudget);
    if (cut >= 12) schoolSlug = schoolSlug.slice(0, cut);
  }

  const combined = [schoolSlug, eventPart].filter(Boolean).join("-");
  return slugifyPressBit(combined || title, maxLength) || "press-byte";
}
