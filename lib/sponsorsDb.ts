import "server-only";

import { query, queryOne } from "@/lib/db";
import {
  detectVideoSourceType,
  type EventVideoSourceType,
  type SponsorInput,
  type SponsorRecord,
} from "@/lib/eventPeopleTypes";
import { upgradeYoutubeThumbUrl, youtubeThumb } from "@/lib/siteVideos";

export type { SponsorInput, SponsorRecord } from "@/lib/eventPeopleTypes";

type SponsorRow = {
  id: string;
  name: string;
  tier: string | null;
  image_url: string | null;
  category: string | null;
  year: number | null;
  video_url: string | null;
  source_type: string | null;
  sort_order: number;
};

function resolveSource(videoUrl: string, preferred?: EventVideoSourceType): EventVideoSourceType {
  if (preferred === "youtube" || preferred === "upload") return preferred;
  if (!videoUrl.trim()) return "youtube";
  return detectVideoSourceType(videoUrl);
}

function resolveImage(imageUrl: string | null | undefined, videoUrl: string, sourceType: EventVideoSourceType) {
  const raw = imageUrl?.trim() || "";
  if (raw) {
    return sourceType === "youtube" ? upgradeYoutubeThumbUrl(raw, videoUrl) : raw;
  }
  if (sourceType === "youtube" && videoUrl) {
    return upgradeYoutubeThumbUrl(youtubeThumb(videoUrl), videoUrl);
  }
  return "";
}

function mapRow(row: SponsorRow): SponsorRecord {
  const videoUrl = row.video_url?.trim() || "";
  const sourceType = resolveSource(videoUrl, (row.source_type as EventVideoSourceType) || undefined);
  return {
    id: row.id,
    name: row.name,
    tier: row.tier?.trim() || "",
    image: resolveImage(row.image_url, videoUrl, sourceType),
    category: row.category?.trim() || "",
    year: Number(row.year) || new Date().getFullYear(),
    videoUrl,
    sourceType,
    sortOrder: row.sort_order,
  };
}

const SELECT_FIELDS = `
  id, name, tier, image_url, category, year, video_url, source_type, sort_order
`;

export async function listSponsorsAdmin(): Promise<SponsorRecord[]> {
  const rows = await query<SponsorRow>(
    `SELECT ${SELECT_FIELDS}
     FROM sponsors
     ORDER BY year DESC, sort_order ASC, created_at DESC`,
  );
  return rows.map(mapRow);
}

export async function getSponsorsFromDb(options?: {
  year?: number;
  category?: string;
}): Promise<SponsorRecord[]> {
  const params: Array<string | number> = [];
  const where: string[] = ["COALESCE(video_url, '') <> ''"];

  if (options?.year) {
    params.push(options.year);
    where.push(`year = $${params.length}`);
  }
  if (options?.category?.trim()) {
    params.push(options.category.trim());
    where.push(`category = $${params.length}`);
  }

  const rows = await query<SponsorRow>(
    `SELECT ${SELECT_FIELDS}
     FROM sponsors
     WHERE ${where.join(" AND ")}
     ORDER BY year DESC, sort_order ASC, created_at DESC`,
    params,
  );
  return rows.map(mapRow);
}

export async function getSponsorFilterOptions(): Promise<{
  years: number[];
  categoriesByYear: Record<number, string[]>;
}> {
  const rows = await query<{ year: number; category: string }>(
    `SELECT DISTINCT year, category
     FROM sponsors
     WHERE COALESCE(video_url, '') <> '' AND year IS NOT NULL AND COALESCE(category, '') <> ''
     ORDER BY year DESC, category ASC`,
  );
  const years = Array.from(new Set(rows.map((row) => Number(row.year)))).sort((a, b) => b - a);
  const categoriesByYear: Record<number, string[]> = {};
  for (const row of rows) {
    const year = Number(row.year);
    if (!categoriesByYear[year]) categoriesByYear[year] = [];
    if (!categoriesByYear[year].includes(row.category)) categoriesByYear[year].push(row.category);
  }
  return { years, categoriesByYear };
}

export async function getSponsorById(id: string): Promise<SponsorRecord | null> {
  const row = await queryOne<SponsorRow>(
    `SELECT ${SELECT_FIELDS} FROM sponsors WHERE id = $1 LIMIT 1`,
    [id],
  );
  return row ? mapRow(row) : null;
}

export async function createSponsor(input: SponsorInput): Promise<SponsorRecord | null> {
  const videoUrl = input.videoUrl?.trim() || "";
  const sourceType = resolveSource(videoUrl, input.sourceType);
  const imageUrl = resolveImage(input.imageUrl, videoUrl, sourceType);
  const row = await queryOne<SponsorRow>(
    `INSERT INTO sponsors (name, tier, image_url, category, year, video_url, source_type, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${SELECT_FIELDS}`,
    [
      input.name.trim(),
      input.tier?.trim() || null,
      imageUrl || null,
      input.category.trim(),
      input.year,
      videoUrl || null,
      sourceType,
      input.sortOrder ?? 0,
    ],
  );
  return row ? mapRow(row) : null;
}

export async function updateSponsor(id: string, input: Partial<SponsorInput>): Promise<SponsorRecord | null> {
  const existing = await getSponsorById(id);
  if (!existing) return null;

  const videoUrl = input.videoUrl !== undefined ? input.videoUrl.trim() : existing.videoUrl;
  const sourceType = resolveSource(videoUrl, input.sourceType ?? existing.sourceType);
  const imageSource =
    input.imageUrl !== undefined ? input.imageUrl.trim() || "" : existing.image || "";
  const imageUrl = resolveImage(imageSource, videoUrl, sourceType);

  const row = await queryOne<SponsorRow>(
    `UPDATE sponsors SET
      name = $2,
      tier = $3,
      image_url = $4,
      category = $5,
      year = $6,
      video_url = $7,
      source_type = $8,
      sort_order = $9,
      updated_at = NOW()
     WHERE id = $1
     RETURNING ${SELECT_FIELDS}`,
    [
      id,
      input.name?.trim() ?? existing.name,
      input.tier !== undefined ? input.tier.trim() || null : existing.tier || null,
      imageUrl || null,
      input.category?.trim() ?? existing.category,
      input.year ?? existing.year,
      videoUrl || null,
      sourceType,
      input.sortOrder ?? existing.sortOrder,
    ],
  );
  return row ? mapRow(row) : null;
}

export async function deleteSponsor(id: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(`DELETE FROM sponsors WHERE id = $1 RETURNING id`, [id]);
  return Boolean(row);
}
