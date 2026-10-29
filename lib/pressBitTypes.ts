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

export function slugifyPressBit(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
