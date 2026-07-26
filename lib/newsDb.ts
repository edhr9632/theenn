import "server-only";

import { mapNewsArticleRow } from "@/lib/mapNewsArticle";
import { query, queryOne } from "@/lib/db";
import type { NewsArticleInput, NewsArticleRow, NewsSection } from "@/lib/newsTypes";

export type { NewsArticleInput, NewsArticleRow, NewsSection } from "@/lib/newsTypes";
export { mapNewsArticleRow } from "@/lib/mapNewsArticle";

const PUBLISHED = "published";

const SELECT_FIELDS = `
  id, slug, section, title, excerpt, content, author, read_time,
  category_label, image_url, image_alt, featured_video, status,
  has_video, is_featured, publish_date, sort_order
`;

export async function getNewsBySection(section: NewsSection, limit?: number): Promise<ReturnType<typeof mapNewsArticleRow>[]> {
  const limitSql = limit ? `LIMIT ${Math.max(1, limit)}` : "";
  const rows = await query<NewsArticleRow>(
    `SELECT ${SELECT_FIELDS}
     FROM news_articles
     WHERE section = $1 AND status = $2
     ORDER BY sort_order ASC, publish_date DESC NULLS LAST, created_at DESC
     ${limitSql}`,
    [section, PUBLISHED],
  );
  return rows.map(mapNewsArticleRow);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticleRow | null> {
  return queryOne<NewsArticleRow>(
    `SELECT ${SELECT_FIELDS} FROM news_articles WHERE slug = $1 LIMIT 1`,
    [slug],
  );
}

export async function getPublishedNewsDetail(slug: string): Promise<{
  article: ReturnType<typeof mapNewsArticleRow>;
  content: string;
  section: NewsSection;
  publishDateIso: string | null;
  featuredVideo: string;
  imageUrl: string;
  imageAlt: string;
} | null> {
  const row = await getNewsBySlug(slug);
  if (!row || row.status !== PUBLISHED) return null;

  return {
    article: mapNewsArticleRow(row),
    content: row.content?.trim() || "",
    section: row.section,
    publishDateIso: row.publish_date,
    featuredVideo: row.featured_video?.trim() || "",
    imageUrl: row.image_url?.trim() || "",
    imageAlt: row.image_alt?.trim() || row.title,
  };
}

export async function listNewsAdmin(section?: NewsSection): Promise<NewsArticleRow[]> {
  if (section) {
    return query<NewsArticleRow>(
      `SELECT ${SELECT_FIELDS} FROM news_articles WHERE section = $1
       ORDER BY sort_order ASC, publish_date DESC NULLS LAST, created_at DESC`,
      [section],
    );
  }
  return query<NewsArticleRow>(
    `SELECT ${SELECT_FIELDS} FROM news_articles
     ORDER BY section, sort_order ASC, publish_date DESC NULLS LAST, created_at DESC`,
  );
}

export async function createNewsArticle(input: NewsArticleInput): Promise<NewsArticleRow | null> {
  return queryOne<NewsArticleRow>(
    `INSERT INTO news_articles (
      slug, section, title, excerpt, content, author, read_time,
      category_label, image_url, image_alt, featured_video, status,
      has_video, publish_date, sort_order, published_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12,
      $13, $14::date, $15,
      CASE WHEN $12 = 'published' THEN NOW() ELSE NULL END
    )
    RETURNING ${SELECT_FIELDS}`,
    [
      input.slug,
      input.section,
      input.title,
      input.excerpt ?? null,
      input.content ?? null,
      input.author ?? null,
      input.readTime ?? null,
      input.categoryLabel ?? null,
      input.imageUrl ?? null,
      input.imageAlt ?? null,
      input.featuredVideo ?? null,
      input.status ?? PUBLISHED,
      Boolean(input.hasVideo),
      input.publishDate ?? new Date().toISOString().slice(0, 10),
      input.sortOrder ?? 0,
    ],
  );
}

export async function updateNewsArticle(
  slug: string,
  input: Partial<NewsArticleInput>,
): Promise<NewsArticleRow | null> {
  const existing = await getNewsBySlug(slug);
  if (!existing) return null;

  return queryOne<NewsArticleRow>(
    `UPDATE news_articles SET
      slug = $2,
      section = $3,
      title = $4,
      excerpt = $5,
      content = $6,
      author = $7,
      read_time = $8,
      category_label = $9,
      image_url = $10,
      image_alt = $11,
      featured_video = $12,
      status = $13,
      has_video = $14,
      publish_date = $15::date,
      sort_order = $16,
      updated_at = NOW(),
      published_at = CASE WHEN $13 = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END
     WHERE slug = $1
     RETURNING ${SELECT_FIELDS}`,
    [
      slug,
      input.slug ?? existing.slug,
      input.section ?? existing.section,
      input.title ?? existing.title,
      input.excerpt ?? existing.excerpt,
      input.content ?? existing.content,
      input.author ?? existing.author,
      input.readTime ?? existing.read_time,
      input.categoryLabel ?? existing.category_label,
      input.imageUrl ?? existing.image_url,
      input.imageAlt ?? existing.image_alt,
      input.featuredVideo ?? existing.featured_video,
      input.status ?? existing.status,
      input.hasVideo ?? existing.has_video,
      input.publishDate ?? existing.publish_date,
      input.sortOrder ?? existing.sort_order,
    ],
  );
}

export async function deleteNewsArticle(slug: string): Promise<boolean> {
  const rows = await query<{ slug: string }>(`DELETE FROM news_articles WHERE slug = $1 RETURNING slug`, [slug]);
  return rows.length > 0;
}
