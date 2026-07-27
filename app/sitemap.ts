import type { MetadataRoute } from "next";
import { siteSeo } from "@/lib/seo";

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

  return staticPaths.map((path) => ({
    url: `${siteSeo.siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/news" || path === "/weekly-news" ? 0.9 : 0.7,
  }));
}
