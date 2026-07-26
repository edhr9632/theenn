import "server-only";

import { query, queryOne } from "@/lib/db";
import type { SiteVideosConfig, SiteVideoTab } from "@/lib/siteVideos";

type VideosConfigRow = {
  enabled: boolean;
  featured_title: string | null;
  youtube_url: string | null;
  channel_url: string | null;
  channel_label: string | null;
  show_education: boolean;
  show_panels: boolean;
  show_podcasts: boolean;
};

type VideoItemRow = {
  id: string;
  tab: SiteVideoTab;
  title: string;
  duration: string | null;
  image_url: string | null;
  youtube_url: string;
  meta: string | null;
  sort_order: number;
};

export async function getVideosConfigFromDb(): Promise<SiteVideosConfig | null> {
  const config = await queryOne<VideosConfigRow>(
    `SELECT enabled, featured_title, youtube_url, channel_url, channel_label,
            show_education, show_panels, show_podcasts
     FROM site_videos_config WHERE id = 1 LIMIT 1`,
  );

  if (!config || !config.enabled) return null;

  const items = await query<VideoItemRow>(
    `SELECT id, tab, title, duration, image_url, youtube_url, meta, sort_order
     FROM site_video_items
     ORDER BY tab, sort_order ASC, created_at DESC`,
  );

  return {
    enabled: config.enabled,
    featuredTitle: config.featured_title?.trim() || "Top Education News",
    youtubeUrl: config.youtube_url?.trim() || "",
    channelUrl: config.channel_url?.trim() || "",
    channelLabel: config.channel_label?.trim() || "YouTube",
    showEducation: config.show_education,
    showPanels: config.show_panels,
    showPodcasts: config.show_podcasts,
    items: items.map((item) => ({
      id: item.id,
      tab: item.tab,
      title: item.title,
      duration: item.duration?.trim() || "",
      image: item.image_url?.trim() || "",
      youtubeUrl: item.youtube_url,
      meta: item.meta?.trim() || "",
    })),
  };
}

/** Prefer importing from @/lib/shortsDb for new code. */
export { getShortVideosFromDb } from "@/lib/shortsDb";
