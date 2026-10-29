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

/**
 * Short SEO slug from long interview titles.
 * e.g. "Campion School, Mumbai Award - Winner Interview | Top 3 Boys..."
 *   → "campion-school-mumbai"
 */
export function buildPressBitSeoSlug(title: string, maxLength = 48) {
  const primary = title.split("|")[0]?.trim() || title;
  const cleaned = primary
    .replace(/\bawards?\b/gi, " ")
    .replace(/\bwinner(?:'s)?\b/gi, " ")
    .replace(/\binterview(?:s)?\b/gi, " ")
    .replace(/\bkeynote\b/gi, " ")
    .replace(/\bspeaker\b/gi, " ")
    .replace(/\bpanel\b/gi, " ")
    .replace(/\bmaharashtra\b/gi, " ")
    .replace(/\beducators?\b/gi, " ")
    .replace(/\bsummit\b/gi, " ")
    .replace(/\bnorth india\b/gi, " ")
    .replace(/\bschool merit awards?\b/gi, " ")
    .replace(/\b20\d{2}(?:-\d{2})?\b/g, " ")
    .replace(/\s*[-–—|:·]+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let slug = slugifyPressBit(cleaned || primary, maxLength);
  if (!slug) slug = slugifyPressBit(title, maxLength) || "press-byte";

  // Prefer cutting on a hyphen boundary so URLs don't end mid-word.
  if (slug.length >= maxLength) {
    const cut = slug.lastIndexOf("-", maxLength);
    if (cut >= 18) slug = slug.slice(0, cut);
  }

  return slug || "press-byte";
}
