import type { NewsArticle } from "@/lib/data";
import type { NewsArticleRow } from "@/lib/newsTypes";
import { hasVideoInHtml, resolveArticleImageUrl } from "@/lib/videoEmbed";

function formatPublishDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function mapNewsArticleRow(row: NewsArticleRow): NewsArticle {
  const image = resolveArticleImageUrl(row);
  const hasFeaturedVideo = Boolean(row.featured_video?.trim());
  const hasContentVideo = hasVideoInHtml(row.content ?? "");

  return {
    slug: row.slug,
    category: row.category_label?.trim() || "Education",
    title: row.title,
    excerpt: row.excerpt?.trim() || "",
    author: row.author?.trim() || "ENN Desk",
    readTime: row.read_time?.trim() || "5 min read",
    date: formatPublishDate(row.publish_date),
    image,
    imageAlt: row.image_alt?.trim() || row.title,
    video: row.has_video || hasFeaturedVideo || hasContentVideo,
  };
}
