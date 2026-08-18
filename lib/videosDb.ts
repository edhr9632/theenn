import "server-only";

import { isDbConfigured, query, queryOne } from "@/lib/db";
import {
  createVideoId,
  DEFAULT_SITE_VIDEOS,
  upgradeYoutubeThumbUrl,
  youtubeThumb,
  type SiteVideoItem,
  type SiteVideoTab,
  type SiteVideosConfig,
} from "@/lib/siteVideos";

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

export type SiteVideosConfigInput = {
  enabled?: boolean;
  featuredTitle?: string;
  youtubeUrl?: string;
  channelUrl?: string;
  channelLabel?: string;
  showEducation?: boolean;
  showPanels?: boolean;
  showPodcasts?: boolean;
};

export type SiteVideoItemInput = {
  title: string;
  tab: SiteVideoTab;
  duration?: string;
  imageUrl?: string;
  youtubeUrl: string;
  meta?: string;
  sortOrder?: number;
};

function mapConfigRow(config: VideosConfigRow, items: VideoItemRow[]): SiteVideosConfig {
  return {
    enabled: config.enabled,
    featuredTitle: config.featured_title?.trim() || DEFAULT_SITE_VIDEOS.featuredTitle,
    youtubeUrl: config.youtube_url?.trim() || DEFAULT_SITE_VIDEOS.youtubeUrl,
    channelUrl: config.channel_url?.trim() || DEFAULT_SITE_VIDEOS.channelUrl,
    channelLabel: config.channel_label?.trim() || DEFAULT_SITE_VIDEOS.channelLabel,
    showEducation: config.show_education,
    showPanels: config.show_panels,
    showPodcasts: config.show_podcasts,
    items: items.map(mapItemRow),
  };
}

function mapItemRow(item: VideoItemRow): SiteVideoItem {
  const youtubeUrl = item.youtube_url.trim();
  const image =
    upgradeYoutubeThumbUrl(item.image_url?.trim() || youtubeThumb(youtubeUrl), youtubeUrl) ||
    youtubeThumb(youtubeUrl);
  return {
    id: item.id,
    tab: item.tab,
    title: item.title,
    duration: item.duration?.trim() || "",
    image,
    youtubeUrl,
    meta: item.meta?.trim() || "",
  };
}

async function loadConfigRow(): Promise<VideosConfigRow | null> {
  return queryOne<VideosConfigRow>(
    `SELECT enabled, featured_title, youtube_url, channel_url, channel_label,
            show_education, show_panels, show_podcasts
     FROM site_videos_config WHERE id = 1 LIMIT 1`,
  );
}

async function loadItemRows(): Promise<VideoItemRow[]> {
  return query<VideoItemRow>(
    `SELECT id, tab, title, duration, image_url, youtube_url, meta, sort_order
     FROM site_video_items
     ORDER BY tab, sort_order ASC, created_at DESC`,
  );
}

/** Public homepage read — returns config even when section is disabled (UI checks enabled). */
export async function getVideosConfigFromDb(): Promise<SiteVideosConfig | null> {
  if (!isDbConfigured()) return null;

  try {
    const config = await loadConfigRow();
    const items = await loadItemRows();
    const mapped = mapConfigRow(
      config ?? {
        enabled: true,
        featured_title: null,
        youtube_url: null,
        channel_url: null,
        channel_label: null,
        show_education: true,
        show_panels: true,
        show_podcasts: true,
      },
      items,
    );
    if (items.length) mapped.enabled = true;
    return mapped;
  } catch (error) {
    console.error("[getVideosConfigFromDb]", error);
    return null;
  }
}

export async function updateVideosConfig(input: SiteVideosConfigInput): Promise<SiteVideosConfig | null> {
  const existing = await loadConfigRow();
  if (!existing) return null;

  const row = await queryOne<VideosConfigRow>(
    `UPDATE site_videos_config SET
      enabled = $1,
      featured_title = $2,
      youtube_url = $3,
      channel_url = $4,
      channel_label = $5,
      show_education = $6,
      show_panels = $7,
      show_podcasts = $8,
      updated_at = NOW()
     WHERE id = 1
     RETURNING enabled, featured_title, youtube_url, channel_url, channel_label,
               show_education, show_panels, show_podcasts`,
    [
      input.enabled ?? existing.enabled,
      input.featuredTitle !== undefined ? input.featuredTitle.trim() || null : existing.featured_title,
      input.youtubeUrl !== undefined ? input.youtubeUrl.trim() || null : existing.youtube_url,
      input.channelUrl !== undefined ? input.channelUrl.trim() || null : existing.channel_url,
      input.channelLabel !== undefined ? input.channelLabel.trim() || null : existing.channel_label,
      input.showEducation ?? existing.show_education,
      input.showPanels ?? existing.show_panels,
      input.showPodcasts ?? existing.show_podcasts,
    ],
  );
  if (!row) return null;
  const items = await loadItemRows();
  return mapConfigRow(row, items);
}

export async function createSiteVideoItem(input: SiteVideoItemInput): Promise<SiteVideoItem | null> {
  const youtubeUrl = input.youtubeUrl.trim();
  const imageUrl = upgradeYoutubeThumbUrl(input.imageUrl?.trim() || youtubeThumb(youtubeUrl), youtubeUrl);
  const id = createVideoId();

  const row = await queryOne<VideoItemRow>(
    `INSERT INTO site_video_items (id, tab, title, duration, image_url, youtube_url, meta, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, tab, title, duration, image_url, youtube_url, meta, sort_order`,
    [
      id,
      input.tab,
      input.title.trim(),
      input.duration?.trim() || null,
      imageUrl || null,
      youtubeUrl,
      input.meta?.trim() || null,
      input.sortOrder ?? 0,
    ],
  );
  return row ? mapItemRow(row) : null;
}

export async function updateSiteVideoItem(
  id: string,
  input: Partial<SiteVideoItemInput>,
): Promise<SiteVideoItem | null> {
  const existing = await queryOne<VideoItemRow>(
    `SELECT id, tab, title, duration, image_url, youtube_url, meta, sort_order
     FROM site_video_items WHERE id = $1 LIMIT 1`,
    [id],
  );
  if (!existing) return null;

  const youtubeUrl = input.youtubeUrl?.trim() ?? existing.youtube_url;
  const imageSource =
    input.imageUrl !== undefined ? input.imageUrl.trim() : existing.image_url?.trim() || "";
  const imageUrl = upgradeYoutubeThumbUrl(imageSource || youtubeThumb(youtubeUrl), youtubeUrl);

  const row = await queryOne<VideoItemRow>(
    `UPDATE site_video_items SET
      tab = $2,
      title = $3,
      duration = $4,
      image_url = $5,
      youtube_url = $6,
      meta = $7,
      sort_order = $8,
      updated_at = NOW()
     WHERE id = $1
     RETURNING id, tab, title, duration, image_url, youtube_url, meta, sort_order`,
    [
      id,
      input.tab ?? existing.tab,
      input.title?.trim() ?? existing.title,
      input.duration !== undefined ? input.duration.trim() || null : existing.duration,
      imageUrl || null,
      youtubeUrl,
      input.meta !== undefined ? input.meta.trim() || null : existing.meta,
      input.sortOrder ?? existing.sort_order,
    ],
  );
  return row ? mapItemRow(row) : null;
}

export async function deleteSiteVideoItem(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(`DELETE FROM site_video_items WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

/** Prefer importing from @/lib/shortsDb for new code. */
export { getShortVideosFromDb } from "@/lib/shortsDb";
