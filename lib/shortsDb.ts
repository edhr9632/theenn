import "server-only";

import { query, queryOne } from "@/lib/db";
import type { ShortVideo, ShortVideoInput } from "@/lib/shortTypes";
import { upgradeYoutubeThumbUrl, youtubeThumb } from "@/lib/siteVideos";

export type { ShortVideo, ShortVideoInput } from "@/lib/shortTypes";

type ShortVideoRow = {
  id: string;
  title: string;
  youtube_url: string;
  image_url: string | null;
  duration: string | null;
  meta: string | null;
  sort_order: number;
  enabled: boolean;
};

function resolveImage(imageUrl: string | null | undefined, youtubeUrl: string) {
  const raw = imageUrl?.trim() || youtubeThumb(youtubeUrl);
  return upgradeYoutubeThumbUrl(raw, youtubeUrl);
}

function mapRow(row: ShortVideoRow): ShortVideo {
  return {
    id: row.id,
    title: row.title,
    youtubeUrl: row.youtube_url,
    image: resolveImage(row.image_url, row.youtube_url),
    duration: row.duration?.trim() || "",
    meta: row.meta?.trim() || "",
    sortOrder: row.sort_order,
    enabled: row.enabled,
  };
}

const SELECT_FIELDS = `
  id, title, youtube_url, image_url, duration, meta, sort_order, enabled
`;

export async function listShortVideosAdmin(): Promise<ShortVideo[]> {
  const rows = await query<ShortVideoRow>(
    `SELECT ${SELECT_FIELDS}
     FROM short_videos
     ORDER BY sort_order ASC, created_at DESC`,
  );
  return rows.map(mapRow);
}

export async function getShortVideosFromDb(limit = 6): Promise<ShortVideo[]> {
  const rows = await query<ShortVideoRow>(
    `SELECT ${SELECT_FIELDS}
     FROM short_videos
     WHERE enabled = TRUE
     ORDER BY sort_order ASC, created_at DESC
     LIMIT $1`,
    [Math.max(1, limit)],
  );
  return rows.map(mapRow);
}

export async function getShortVideoById(id: string): Promise<ShortVideo | null> {
  const row = await queryOne<ShortVideoRow>(
    `SELECT ${SELECT_FIELDS} FROM short_videos WHERE id = $1 LIMIT 1`,
    [id],
  );
  return row ? mapRow(row) : null;
}

export async function createShortVideo(input: ShortVideoInput): Promise<ShortVideo | null> {
  const youtubeUrl = input.youtubeUrl.trim();
  const imageUrl = resolveImage(input.imageUrl, youtubeUrl);
  const row = await queryOne<ShortVideoRow>(
    `INSERT INTO short_videos (title, youtube_url, image_url, duration, meta, sort_order, enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${SELECT_FIELDS}`,
    [
      input.title.trim(),
      youtubeUrl,
      imageUrl || null,
      input.duration?.trim() || null,
      input.meta?.trim() || null,
      input.sortOrder ?? 0,
      input.enabled ?? true,
    ],
  );
  return row ? mapRow(row) : null;
}

export async function updateShortVideo(
  id: string,
  input: Partial<ShortVideoInput>,
): Promise<ShortVideo | null> {
  const existing = await getShortVideoById(id);
  if (!existing) return null;

  const youtubeUrl = input.youtubeUrl?.trim() ?? existing.youtubeUrl;
  const imageSource =
    input.imageUrl !== undefined ? input.imageUrl.trim() || "" : existing.image || "";
  const imageUrl = resolveImage(imageSource, youtubeUrl);

  const row = await queryOne<ShortVideoRow>(
    `UPDATE short_videos SET
      title = $2,
      youtube_url = $3,
      image_url = $4,
      duration = $5,
      meta = $6,
      sort_order = $7,
      enabled = $8,
      updated_at = NOW()
     WHERE id = $1
     RETURNING ${SELECT_FIELDS}`,
    [
      id,
      input.title?.trim() ?? existing.title,
      youtubeUrl,
      imageUrl || null,
      input.duration !== undefined ? input.duration.trim() || null : existing.duration || null,
      input.meta !== undefined ? input.meta.trim() || null : existing.meta || null,
      input.sortOrder ?? existing.sortOrder,
      input.enabled ?? existing.enabled,
    ],
  );
  return row ? mapRow(row) : null;
}

export async function deleteShortVideo(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(`DELETE FROM short_videos WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
