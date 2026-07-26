export type SiteVideoTab = "education" | "panels" | "podcasts";

export type SiteVideoItem = {
  id: string;
  title: string;
  duration: string;
  image: string;
  youtubeUrl: string;
  meta: string;
  tab: SiteVideoTab;
};

export type SiteVideosConfig = {
  enabled: boolean;
  featuredTitle: string;
  youtubeUrl: string;
  channelUrl: string;
  channelLabel: string;
  showEducation: boolean;
  showPanels: boolean;
  showPodcasts: boolean;
  items: SiteVideoItem[];
};

export const SITE_VIDEOS_STORAGE_KEY = "enn_admin_site_videos";

export const DEFAULT_SITE_VIDEOS: SiteVideosConfig = {
  enabled: true,
  featuredTitle:
    process.env.NEXT_PUBLIC_TOP_NEWS_YOUTUBE_TITLE?.trim() ||
    "Global Summit Opens in Geneva With Climate at the Center",
  youtubeUrl:
    process.env.NEXT_PUBLIC_TOP_NEWS_YOUTUBE_URL?.trim() ||
    "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  channelUrl:
    process.env.NEXT_PUBLIC_TOP_NEWS_CHANNEL_URL?.trim() ||
    "https://www.youtube.com/@educationtoday7909",
  channelLabel: process.env.NEXT_PUBLIC_TOP_NEWS_CHANNEL_LABEL?.trim() || "Education Today",
  showEducation: true,
  showPanels: true,
  showPodcasts: true,
  items: [],
};

export function createVideoId() {
  return `vid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function extractYoutubeId(url: string) {
  const match =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/) ?? null;
  return match?.[1] ?? null;
}

/** Highest public YouTube still (maxres ≈ 1280×720). True 4K stills are not exposed by YouTube. */
export function youtubeThumbUrl(videoId: string, quality: "maxres" | "sd" | "hq" = "maxres") {
  const file =
    quality === "maxres" ? "maxresdefault.jpg" : quality === "sd" ? "sddefault.jpg" : "hqdefault.jpg";
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
}

export function youtubeThumb(url: string) {
  const id = extractYoutubeId(url);
  return id ? youtubeThumbUrl(id, "maxres") : "";
}

/** Prefer maxres for any YouTube thumb URL already stored as hq/mq/default. */
export function upgradeYoutubeThumbUrl(imageUrl: string, youtubeUrl?: string) {
  const fromImage = imageUrl.match(/\/vi\/([A-Za-z0-9_-]{6,})\//)?.[1];
  const id = fromImage || (youtubeUrl ? extractYoutubeId(youtubeUrl) : null);
  if (!id) return imageUrl;
  if (/ytimg\.com|img\.youtube\.com/i.test(imageUrl) || !imageUrl.trim()) {
    return youtubeThumbUrl(id, "maxres");
  }
  return imageUrl;
}

export function youtubeThumbFallbacks(url: string): string[] {
  const id = extractYoutubeId(url);
  if (!id) return [];
  return [youtubeThumbUrl(id, "maxres"), youtubeThumbUrl(id, "sd"), youtubeThumbUrl(id, "hq")];
}

export function readSiteVideos(): SiteVideosConfig {
  if (typeof window === "undefined") return DEFAULT_SITE_VIDEOS;
  try {
    const raw = window.localStorage.getItem(SITE_VIDEOS_STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_VIDEOS;
    const parsed = JSON.parse(raw) as Partial<SiteVideosConfig>;
    return {
      ...DEFAULT_SITE_VIDEOS,
      ...parsed,
      enabled: parsed.enabled ?? DEFAULT_SITE_VIDEOS.enabled,
      showEducation: parsed.showEducation ?? true,
      showPanels: parsed.showPanels ?? true,
      showPodcasts: parsed.showPodcasts ?? true,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return DEFAULT_SITE_VIDEOS;
  }
}

export function writeSiteVideos(config: SiteVideosConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SITE_VIDEOS_STORAGE_KEY, JSON.stringify(config));
}

export function resolveFeaturedVideo(config: SiteVideosConfig = DEFAULT_SITE_VIDEOS) {
  const youtubeUrl = config.youtubeUrl.trim() || DEFAULT_SITE_VIDEOS.youtubeUrl;
  const videoId = extractYoutubeId(youtubeUrl) || "aqz-KE-bpKQ";
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

  return {
    title: config.featuredTitle.trim() || DEFAULT_SITE_VIDEOS.featuredTitle,
    youtubeUrl,
    channelUrl: config.channelUrl.trim() || DEFAULT_SITE_VIDEOS.channelUrl,
    channelLabel: config.channelLabel.trim() || DEFAULT_SITE_VIDEOS.channelLabel,
    videoId,
    embedUrl,
    watchUrl,
  };
}
