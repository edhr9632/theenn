import "server-only";

import type { NewsArticle } from "@/lib/data";
import { isDbConfigured } from "@/lib/db";
import { getNewsBySection } from "@/lib/newsDb";
import { getPanelDiscussionsFromDb } from "@/lib/panelsDb";
import { getPromoBanner } from "@/lib/promoDb";
import { getShortVideosFromDb } from "@/lib/shortsDb";
import { getVideosConfigFromDb } from "@/lib/videosDb";
import { HOME_SHORTS_DISPLAY_MAX, HOME_VIDEOS_DISPLAY_MAX } from "@/lib/siteVideos";
import type { SiteVideosConfig } from "@/lib/siteVideos";
import type { PanelDiscussionItem, PromoBanner } from "@/lib/homeTypes";

export type HomePageData = {
  dbConnected: boolean;
  topEducation: NewsArticle[];
  daily: NewsArticle[];
  trending: NewsArticle[];
  latest: NewsArticle[];
  mostRead: NewsArticle[];
  tvSchedule: PromoBanner | null;
  partnerBanner: PromoBanner | null;
  panels: PanelDiscussionItem[];
  videosConfig: SiteVideosConfig | null;
  shortVideos: Awaited<ReturnType<typeof getShortVideosFromDb>>;
};

export async function getHomePageData(): Promise<HomePageData> {
  const empty: HomePageData = {
    dbConnected: false,
    topEducation: [],
    daily: [],
    trending: [],
    latest: [],
    mostRead: [],
    tvSchedule: null,
    partnerBanner: null,
    panels: [],
    videosConfig: null,
    shortVideos: [],
  };

  if (!isDbConfigured()) return empty;

  try {
    const settled = await Promise.allSettled([
      getNewsBySection("top_education", 8),
      getNewsBySection("daily", 10),
      getNewsBySection("trending", 6),
      getPromoBanner("tv_schedule"),
      getPromoBanner("partner_msa"),
      getPanelDiscussionsFromDb(HOME_VIDEOS_DISPLAY_MAX),
      getVideosConfigFromDb(),
      getShortVideosFromDb(HOME_SHORTS_DISPLAY_MAX),
    ]);

    const value = <T,>(index: number, fallback: T): T => {
      const result = settled[index];
      if (result.status === "fulfilled") return result.value as T;
      console.error(`[getHomePageData] query ${index} failed`, result.reason);
      return fallback;
    };

    const topEducation = value(0, [] as NewsArticle[]);
    const daily = value(1, [] as NewsArticle[]);
    const trending = value(2, [] as NewsArticle[]);
    const tvSchedule = value(3, null as PromoBanner | null);
    const partnerBanner = value(4, null as PromoBanner | null);
    const panels = value(5, [] as PanelDiscussionItem[]);
    const videosConfig = value(6, null as SiteVideosConfig | null);
    const shortVideos = value(7, [] as Awaited<ReturnType<typeof getShortVideosFromDb>>);

    const latest = daily.slice(0, 4);
    const trendingShown = trending.length
      ? trending
      : [...daily, ...topEducation]
          .filter((article, index, list) => list.findIndex((item) => item.slug === article.slug) === index)
          .slice(0, 6);
    // Recent Blogs sidebar: newest published stories across sections (deduped).
    const mostRead = [...daily, ...trending, ...topEducation]
      .filter((article, index, list) => list.findIndex((item) => item.slug === article.slug) === index)
      .slice(0, 6);

    return {
      dbConnected: true,
      topEducation: topEducation.slice(0, 5),
      daily,
      trending: trendingShown,
      latest,
      mostRead,
      tvSchedule,
      partnerBanner,
      panels,
      videosConfig,
      shortVideos,
    };
  } catch (error) {
    console.error("[getHomePageData]", error);
    return empty;
  }
}
