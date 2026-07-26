import { hasVideoInHtml } from "@/lib/videoEmbed";
import type { FormEvent } from "react";
import type { NewsSection } from "@/lib/newsTypes";

export function parseAdminArticleForm(form: HTMLFormElement) {
  const fd = new FormData(form);
  const title = String(fd.get("title") ?? "").trim();
  const slug = String(fd.get("slug") ?? "").trim();
  const section = String(fd.get("newsSection") ?? "daily") as NewsSection;
  const excerpt = String(fd.get("excerpt") ?? "").trim();
  const content = String(fd.get("content") ?? "").trim();
  const author = String(fd.get("author") ?? "").trim();
  const readTime = String(fd.get("readTime") ?? "5 min read").trim();
  const categoryLabel = String(fd.get("categoryName") ?? fd.get("category") ?? "Education").trim();
  const imageUrl = String(fd.get("imageData") ?? fd.get("image") ?? "").trim();
  const imageAlt = String(fd.get("imageAlt") ?? title).trim();
  const featuredVideo = String(fd.get("featuredVideo") ?? "").trim();
  const status = String(fd.get("status") ?? "published").trim();
  const publishDate = String(fd.get("publishDate") ?? "").trim();
  const sortOrder = Number(fd.get("sortOrder") ?? 0) || 0;
  const hasVideo = Boolean(featuredVideo) || hasVideoInHtml(content);

  return {
    slug,
    section,
    title,
    excerpt,
    content,
    author,
    readTime,
    categoryLabel,
    imageUrl,
    imageAlt,
    featuredVideo,
    status,
    publishDate: publishDate || undefined,
    sortOrder,
    hasVideo,
  };
}

export async function submitAdminArticleForm(
  event: FormEvent<HTMLFormElement>,
  mode: "create" | "update",
  originalSlug?: string,
) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = parseAdminArticleForm(form);

  const url =
    mode === "create" ? "/api/admin/news" : `/api/admin/news/${encodeURIComponent(originalSlug ?? payload.slug)}`;
  const method = mode === "create" ? "POST" : "PUT";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { error?: string };
  if (!response.ok) {
    window.alert(data.error ?? "Could not save article. Is PostgreSQL running?");
    return false;
  }
  return true;
}
