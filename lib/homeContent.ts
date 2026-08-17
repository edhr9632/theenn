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
    const [topEducation, daily, trending, tvSchedule, partnerBanner, panels, videosConfig, shortVideos] =
      await Promise.all([
        getNewsBySection("top_education", 5),
        getNewsBySection("daily", 10),
        getNewsBySection("trending", 6),
        getPromoBanner("tv_schedule"),
        getPromoBanner("partner_msa"),
        getPanelDiscussionsFromDb(HOME_VIDEOS_DISPLAY_MAX),
        getVideosConfigFromDb(),
        getShortVideosFromDb(HOME_SHORTS_DISPLAY_MAX),
      ]);

    const latest = daily.slice(0, 4);
    const trendingShown = trending.length
      ? trending
      : [...daily, ...topEducation]
          .filter((article, index, list) => list.findIndex((item) => item.slug === article.slug) === index)
          .slice(0, 6);
    const mostRead = trendingShown.length ? trendingShown : daily.slice(0, 6);

    return {
      dbConnected: true,
      topEducation,
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
