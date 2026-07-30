import "server-only";

import { query, queryOne } from "@/lib/db";
import type { PanelDiscussionItem } from "@/lib/homeTypes";

export type { PanelDiscussionItem } from "@/lib/homeTypes";

type PanelRow = {
  id: string;
  episode: string;
  duration: string | null;
  topic: string | null;
  title: string;
  speakers: string | null;
  image_url: string | null;
  youtube_url: string;
  sort_order: number;
};

export async function getPanelDiscussionsFromDb(limit = 4): Promise<PanelDiscussionItem[]> {
  const rows = await query<PanelRow>(
    `SELECT id, episode, duration, topic, title, speakers, image_url, youtube_url, sort_order
     FROM panel_discussions
     ORDER BY sort_order ASC, created_at DESC
     LIMIT $1`,
    [limit],
  );

  return rows.map((row) => ({
    episode: row.episode,
    duration: row.duration?.trim() || "",
    topic: row.topic?.trim() || "Education",
    title: row.title,
    speakers: row.speakers?.trim() || "",
    image:
      row.image_url?.trim() ||
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=85",
    youtube: row.youtube_url,
  }));
}

export type AdminPanelItem = PanelDiscussionItem & {
  id: string;
  sortOrder: number;
};

export type AdminPanelInput = {
  title: string;
  topic?: string;
  speakers?: string;
  duration?: string;
  youtubeUrl: string;
  imageUrl?: string;
  sortOrder?: number;
};

function mapAdminRow(row: PanelRow): AdminPanelItem {
  return {
    id: row.id,
    episode: row.episode,
    duration: row.duration?.trim() || "",
    topic: row.topic?.trim() || "Education",
    title: row.title,
    speakers: row.speakers?.trim() || "",
    image:
      row.image_url?.trim() ||
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=85",
    youtube: row.youtube_url,
    sortOrder: row.sort_order ?? 0,
  };
}

function makeEpisodeCode() {
  return `PNL-${Date.now().toString(36).toUpperCase()}`;
}

export async function listPanelDiscussionsAdmin(): Promise<AdminPanelItem[]> {
  const rows = await query<PanelRow>(
    `SELECT id, episode, duration, topic, title, speakers, image_url, youtube_url, sort_order
     FROM panel_discussions
     ORDER BY sort_order ASC, created_at DESC`,
  );
  return rows.map(mapAdminRow);
}

export async function createPanelDiscussion(input: AdminPanelInput): Promise<AdminPanelItem | null> {
  const row = await queryOne<PanelRow>(
    `INSERT INTO panel_discussions
      (episode, duration, topic, title, speakers, image_url, youtube_url, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, episode, duration, topic, title, speakers, image_url, youtube_url, sort_order`,
    [
      makeEpisodeCode(),
      input.duration?.trim() || null,
      input.topic?.trim() || null,
      input.title.trim(),
      input.speakers?.trim() || null,
      input.imageUrl?.trim() || null,
      input.youtubeUrl.trim(),
      input.sortOrder ?? 0,
    ],
  );
  return row ? mapAdminRow(row) : null;
}

export async function updatePanelDiscussion(id: string, input: Partial<AdminPanelInput>): Promise<AdminPanelItem | null> {
  const key = id.trim();
  const existing = await queryOne<PanelRow>(
    `SELECT id, episode, duration, topic, title, speakers, image_url, youtube_url, sort_order
     FROM panel_discussions
     WHERE id::text = $1 OR episode = $1
     LIMIT 1`,
    [key],
  );
  if (!existing) return null;

  const row = await queryOne<PanelRow>(
    `UPDATE panel_discussions SET
      duration = $2,
      topic = $3,
      title = $4,
      speakers = $5,
      image_url = $6,
      youtube_url = $7,
      sort_order = $8,
      updated_at = NOW()
     WHERE id = $1
     RETURNING id, episode, duration, topic, title, speakers, image_url, youtube_url, sort_order`,
    [
      existing.id,
      input.duration !== undefined ? input.duration.trim() || null : existing.duration,
      input.topic !== undefined ? input.topic.trim() || null : existing.topic,
      input.title !== undefined ? input.title.trim() : existing.title,
      input.speakers !== undefined ? input.speakers.trim() || null : existing.speakers,
      input.imageUrl !== undefined ? input.imageUrl.trim() || null : existing.image_url,
      input.youtubeUrl !== undefined ? input.youtubeUrl.trim() : existing.youtube_url,
      input.sortOrder ?? existing.sort_order,
    ],
  );
  return row ? mapAdminRow(row) : null;
}

export async function deletePanelDiscussion(id: string): Promise<boolean> {
  const key = id.trim();
  if (!key) return false;

  // Use id::text so non-UUID keys (old episode codes) do not throw before episode match.
  const deleted = await query<{ id: string }>(
    `DELETE FROM panel_discussions
     WHERE id::text = $1 OR episode = $1
     RETURNING id`,
    [key],
  );
  return deleted.length > 0;
}
