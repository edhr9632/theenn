import "server-only";

import { query, queryOne } from "@/lib/db";
import {
  detectVideoSourceType,
  type EventVideoSourceType,
  type SpeakerInput,
  type SpeakerRecord,
} from "@/lib/eventPeopleTypes";
import { upgradeYoutubeThumbUrl, youtubeThumb } from "@/lib/siteVideos";

export type { SpeakerInput, SpeakerRecord } from "@/lib/eventPeopleTypes";

type SpeakerRow = {
  id: string;
  name: string;
  role: string | null;
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

function mapRow(row: SpeakerRow): SpeakerRecord {
  const videoUrl = row.video_url?.trim() || "";
  const sourceType = resolveSource(videoUrl, (row.source_type as EventVideoSourceType) || undefined);
  return {
    id: row.id,
    name: row.name,
    role: row.role?.trim() || "",
    image: resolveImage(row.image_url, videoUrl, sourceType),
    category: row.category?.trim() || "",
    year: Number(row.year) || new Date().getFullYear(),
    videoUrl,
    sourceType,
    sortOrder: row.sort_order,
  };
}

const SELECT_FIELDS = `
  id, name, role, image_url, category, year, video_url, source_type, sort_order
`;

export async function listSpeakersAdmin(): Promise<SpeakerRecord[]> {
  const rows = await query<SpeakerRow>(
    `SELECT ${SELECT_FIELDS}
     FROM speakers
     ORDER BY year DESC, sort_order ASC, created_at DESC`,
  );
  return rows.map(mapRow);
}

export async function getSpeakersFromDb(options?: {
  year?: number;
  category?: string;
}): Promise<SpeakerRecord[]> {
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

  const rows = await query<SpeakerRow>(
    `SELECT ${SELECT_FIELDS}
     FROM speakers
     WHERE ${where.join(" AND ")}
     ORDER BY year DESC, sort_order ASC, created_at DESC`,
    params,
  );
  return rows.map(mapRow);
}

export async function getSpeakerFilterOptions(): Promise<{
  years: number[];
  categoriesByYear: Record<number, string[]>;
}> {
  const rows = await query<{ year: number; category: string }>(
    `SELECT DISTINCT year, category
     FROM speakers
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

export async function getSpeakerById(id: string): Promise<SpeakerRecord | null> {
  const row = await queryOne<SpeakerRow>(
    `SELECT ${SELECT_FIELDS} FROM speakers WHERE id = $1 LIMIT 1`,
    [id],
  );
  return row ? mapRow(row) : null;
}

export async function createSpeaker(input: SpeakerInput): Promise<SpeakerRecord | null> {
  const videoUrl = input.videoUrl?.trim() || "";
  const sourceType = resolveSource(videoUrl, input.sourceType);
  const imageUrl = resolveImage(input.imageUrl, videoUrl, sourceType);
  const row = await queryOne<SpeakerRow>(
    `INSERT INTO speakers (name, role, image_url, category, year, video_url, source_type, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${SELECT_FIELDS}`,
    [
      input.name.trim(),
      input.role?.trim() || null,
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

export async function updateSpeaker(id: string, input: Partial<SpeakerInput>): Promise<SpeakerRecord | null> {
  const existing = await getSpeakerById(id);
  if (!existing) return null;

  const videoUrl = input.videoUrl !== undefined ? input.videoUrl.trim() : existing.videoUrl;
  const sourceType = resolveSource(videoUrl, input.sourceType ?? existing.sourceType);
  const imageSource =
    input.imageUrl !== undefined ? input.imageUrl.trim() || "" : existing.image || "";
  const imageUrl = resolveImage(imageSource, videoUrl, sourceType);

  const row = await queryOne<SpeakerRow>(
    `UPDATE speakers SET
      name = $2,
      role = $3,
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
      input.role !== undefined ? input.role.trim() || null : existing.role || null,
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

export async function deleteSpeaker(id: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(`DELETE FROM speakers WHERE id = $1 RETURNING id`, [id]);
  return Boolean(row);
}
