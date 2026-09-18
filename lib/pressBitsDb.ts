import "server-only";

import { query, queryOne } from "@/lib/db";
import type { PressBit, PressBitInput, PressBitSourceType } from "@/lib/pressBitTypes";
import { upgradeYoutubeThumbUrl, youtubeThumb } from "@/lib/siteVideos";

export type { PressBit, PressBitInput } from "@/lib/pressBitTypes";

type PressBitRow = {
  id: string;
  title: string;
  video_url: string;
  source_type: string;
  image_url: string | null;
  year: number;
  category: string;
  sort_order: number;
  enabled: boolean;
};

function detectSourceType(videoUrl: string, preferred?: PressBitSourceType): PressBitSourceType {
  if (preferred === "upload" || preferred === "youtube") return preferred;
  return /youtube\.com|youtu\.be/i.test(videoUrl) ? "youtube" : "upload";
}

function resolveImage(
  imageUrl: string | null | undefined,
  videoUrl: string,
  sourceType: PressBitSourceType,
) {
  const raw = imageUrl?.trim() || "";
  if (raw) {
    return sourceType === "youtube" ? upgradeYoutubeThumbUrl(raw, videoUrl) : raw;
  }
  if (sourceType === "youtube") {
    return upgradeYoutubeThumbUrl(youtubeThumb(videoUrl), videoUrl);
  }
  return "";
}

function mapRow(row: PressBitRow): PressBit {
  const sourceType = detectSourceType(row.video_url, row.source_type as PressBitSourceType);
  return {
    id: row.id,
    title: row.title,
    videoUrl: row.video_url,
    sourceType,
    image: resolveImage(row.image_url, row.video_url, sourceType),
    year: Number(row.year),
    category: row.category,
    sortOrder: row.sort_order,
    enabled: row.enabled,
  };
}

const SELECT_FIELDS = `
  id, title, video_url, source_type, image_url, year, category, sort_order, enabled
`;

export async function listPressBitsAdmin(): Promise<PressBit[]> {
  const rows = await query<PressBitRow>(
    `SELECT ${SELECT_FIELDS}
     FROM press_bits
     ORDER BY year DESC, sort_order ASC, created_at DESC`,
  );
  return rows.map(mapRow);
}

export async function getPressBitsFromDb(options?: {
  year?: number;
  category?: string;
  limit?: number;
}): Promise<PressBit[]> {
  const limit = Math.max(1, options?.limit ?? 100);
  const params: Array<string | number> = [];
  const where: string[] = ["enabled = TRUE"];

  if (options?.year) {
    params.push(options.year);
    where.push(`year = $${params.length}`);
  }
  if (options?.category?.trim()) {
    params.push(options.category.trim());
    where.push(`category = $${params.length}`);
  }

  params.push(limit);
  const rows = await query<PressBitRow>(
    `SELECT ${SELECT_FIELDS}
     FROM press_bits
     WHERE ${where.join(" AND ")}
     ORDER BY year DESC, sort_order ASC, created_at DESC
     LIMIT $${params.length}`,
    params,
  );
  return rows.map(mapRow);
}

export async function getPressBitFilterOptions(): Promise<{
  years: number[];
  categoriesByYear: Record<number, string[]>;
}> {
  const rows = await query<{ year: number; category: string }>(
    `SELECT DISTINCT year, category
     FROM press_bits
     WHERE enabled = TRUE
     ORDER BY year DESC, category ASC`,
  );

  const years = Array.from(new Set(rows.map((row) => Number(row.year)))).sort((a, b) => b - a);
  const categoriesByYear: Record<number, string[]> = {};
  for (const row of rows) {
    const year = Number(row.year);
    if (!categoriesByYear[year]) categoriesByYear[year] = [];
    if (!categoriesByYear[year].includes(row.category)) {
      categoriesByYear[year].push(row.category);
    }
  }
  return { years, categoriesByYear };
}

export async function getPressBitById(id: string): Promise<PressBit | null> {
  const row = await queryOne<PressBitRow>(
    `SELECT ${SELECT_FIELDS} FROM press_bits WHERE id = $1 LIMIT 1`,
    [id],
  );
  return row ? mapRow(row) : null;
}

export async function createPressBit(input: PressBitInput): Promise<PressBit | null> {
  const videoUrl = input.videoUrl.trim();
  const sourceType = detectSourceType(videoUrl, input.sourceType);
  const imageUrl = resolveImage(input.imageUrl, videoUrl, sourceType);
  const row = await queryOne<PressBitRow>(
    `INSERT INTO press_bits (title, video_url, source_type, image_url, year, category, sort_order, enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${SELECT_FIELDS}`,
    [
      input.title.trim(),
      videoUrl,
      sourceType,
      imageUrl || null,
      input.year,
      input.category.trim(),
      input.sortOrder ?? 0,
      input.enabled ?? true,
    ],
  );
  return row ? mapRow(row) : null;
}

export async function updatePressBit(id: string, input: Partial<PressBitInput>): Promise<PressBit | null> {
  const existing = await getPressBitById(id);
  if (!existing) return null;

  const videoUrl = input.videoUrl?.trim() ?? existing.videoUrl;
  const sourceType = detectSourceType(videoUrl, input.sourceType ?? existing.sourceType);
  const imageSource =
    input.imageUrl !== undefined ? input.imageUrl.trim() || "" : existing.image || "";
  const imageUrl = resolveImage(imageSource, videoUrl, sourceType);

  const row = await queryOne<PressBitRow>(
    `UPDATE press_bits SET
      title = $2,
      video_url = $3,
      source_type = $4,
      image_url = $5,
      year = $6,
      category = $7,
      sort_order = $8,
      enabled = $9,
      updated_at = NOW()
     WHERE id = $1
     RETURNING ${SELECT_FIELDS}`,
    [
      id,
      input.title?.trim() ?? existing.title,
      videoUrl,
      sourceType,
      imageUrl || null,
      input.year ?? existing.year,
      input.category?.trim() ?? existing.category,
      input.sortOrder ?? existing.sortOrder,
      input.enabled ?? existing.enabled,
    ],
  );
  return row ? mapRow(row) : null;
}

export async function deletePressBit(id: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(`DELETE FROM press_bits WHERE id = $1 RETURNING id`, [id]);
  return Boolean(row);
}
