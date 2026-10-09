import type { MetadataRoute } from "next";
import { listPublishedNewsKnowledge } from "@/lib/newsDb";
import { siteSeo } from "@/lib/seo";
import { getWeeklyAdminState } from "@/lib/weeklyDb";

const staticPaths: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/news", changeFrequency: "hourly", priority: 0.95 },
  { path: "/trending-news", changeFrequency: "hourly", priority: 0.9 },
  { path: "/press-release", changeFrequency: "daily", priority: 0.85 },
  { path: "/weekly-news", changeFrequency: "daily", priority: 0.9 },
  { path: "/insights", changeFrequency: "daily", priority: 0.85 },
  { path: "/panel-discussions", changeFrequency: "weekly", priority: 0.8 },
  { path: "/podcasts", changeFrequency: "weekly", priority: 0.8 },
  { path: "/events", changeFrequency: "weekly", priority: 0.85 },
  { path: "/events/speakers", changeFrequency: "weekly", priority: 0.75 },
  { path: "/events/sponsors", changeFrequency: "weekly", priority: 0.7 },
  { path: "/events/press-bits", changeFrequency: "weekly", priority: 0.75 },
  { path: "/ask", changeFrequency: "daily", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.65 },
  { path: "/newsletter", changeFrequency: "monthly", priority: 0.7 },
  { path: "/subscribe", changeFrequency: "monthly", priority: 0.65 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/ethics", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticPaths.map(({ path, changeFrequency, priority }) => ({
    url: `${siteSeo.siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  try {
    const articles = await listPublishedNewsKnowledge(500);
    for (const article of articles) {
      entries.push({
        url: `${siteSeo.siteUrl}/news/${article.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    /* DB unavailable — static paths only */
  }

  try {
    const weekly = await getWeeklyAdminState();
    for (const issue of weekly.issues) {
      entries.push({
        url: `${siteSeo.siteUrl}/weekly-news/${issue.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }
  } catch {
    /* weekly unavailable */
  }

  return entries;
}
