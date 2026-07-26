import "server-only";

import { query } from "@/lib/db";
import type { PanelDiscussionItem } from "@/lib/homeTypes";

export type { PanelDiscussionItem } from "@/lib/homeTypes";

type PanelRow = {
  episode: string;
  duration: string | null;
  topic: string | null;
  title: string;
  speakers: string | null;
  image_url: string | null;
  youtube_url: string;
};

export async function getPanelDiscussionsFromDb(limit = 4): Promise<PanelDiscussionItem[]> {
  const rows = await query<PanelRow>(
    `SELECT episode, duration, topic, title, speakers, image_url, youtube_url
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
