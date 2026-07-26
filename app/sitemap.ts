import type { MetadataRoute } from "next";
import { newsArticles } from "@/lib/data";
import { podcastShows } from "@/lib/podcasts";
import { siteSeo } from "@/lib/seo";
import { weeklyIssues } from "@/lib/weeklyIssues";

const staticPaths = [
  "/",
  "/news",
  "/trending-news",
  "/press-release",
  "/weekly-news",
  "/panel-discussions",
  "/podcasts",
  "/events",
  "/events/speakers",
  "/events/sponsors",
  "/about",
  "/contact",
  "/insights",
  "/newsletter",
  "/subscribe",
  "/privacy",
  "/terms",
  "/ethics",
  "/ask",
  "/audio/daily-latest.mp3",
  "/feed/daily-audio.xml",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteSeo.siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/news" || path === "/weekly-news" ? 0.9 : 0.7,
  }));

  const newsEntries: MetadataRoute.Sitemap = newsArticles.map((article) => ({
    url: `${siteSeo.siteUrl}/news/${article.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const podcastEntries: MetadataRoute.Sitemap = podcastShows.map((show) => ({
    url: `${siteSeo.siteUrl}/podcasts/${show.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const weeklyEntries: MetadataRoute.Sitemap = weeklyIssues.map((issue) => ({
    url: `${siteSeo.siteUrl}/weekly-news/${issue.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticEntries, ...newsEntries, ...podcastEntries, ...weeklyEntries];
}
