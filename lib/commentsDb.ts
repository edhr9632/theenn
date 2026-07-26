import "server-only";

import { query, queryOne } from "@/lib/db";
import type { AdminArticleComment, ArticleComment, ArticleCommentInput } from "@/lib/commentTypes";

export type { AdminArticleComment, ArticleComment, ArticleCommentInput } from "@/lib/commentTypes";

type CommentRow = {
  id: string;
  article_slug: string;
  author_name: string;
  author_email: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: Date | string;
};

type AdminCommentRow = CommentRow & {
  article_title: string | null;
};

function mapCommentRow(row: CommentRow): ArticleComment {
  return {
    id: row.id,
    articleSlug: row.article_slug,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapAdminCommentRow(row: AdminCommentRow): AdminArticleComment {
  return {
    ...mapCommentRow(row),
    articleTitle: row.article_title?.trim() || row.article_slug,
  };
}

export async function listApprovedComments(articleSlug: string, limit = 100): Promise<ArticleComment[]> {
  const rows = await query<CommentRow>(
    `SELECT id, article_slug, author_name, author_email, body, status, created_at
     FROM article_comments
     WHERE article_slug = $1 AND status = 'approved'
     ORDER BY created_at DESC
     LIMIT $2`,
    [articleSlug, Math.max(1, Math.min(limit, 200))],
  );
  return rows.map(mapCommentRow);
}

export async function listCommentsAdmin(
  status?: "pending" | "approved" | "rejected" | "all",
): Promise<AdminArticleComment[]> {
  const filter = status && status !== "all" ? status : null;
  const rows = await query<AdminCommentRow>(
    `SELECT c.id, c.article_slug, c.author_name, c.author_email, c.body, c.status, c.created_at,
            a.title AS article_title
     FROM article_comments c
     LEFT JOIN news_articles a ON a.slug = c.article_slug
     WHERE ($1::text IS NULL OR c.status = $1)
     ORDER BY
       CASE c.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
       c.created_at DESC`,
    [filter],
  );
  return rows.map(mapAdminCommentRow);
}

export async function countPendingComments(): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM article_comments WHERE status = 'pending'`,
  );
  return Number(row?.count ?? 0);
}

export async function createArticleComment(
  articleSlug: string,
  input: ArticleCommentInput,
): Promise<ArticleComment | null> {
  const row = await queryOne<CommentRow>(
    `INSERT INTO article_comments (article_slug, author_name, author_email, body, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id, article_slug, author_name, author_email, body, status, created_at`,
    [
      articleSlug,
      input.authorName.trim(),
      input.authorEmail?.trim() || null,
      input.body.trim(),
    ],
  );
  return row ? mapCommentRow(row) : null;
}

export async function updateCommentStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
): Promise<AdminArticleComment | null> {
  const updated = await queryOne<CommentRow>(
    `UPDATE article_comments SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, article_slug, author_name, author_email, body, status, created_at`,
    [id, status],
  );
  if (!updated) return null;

  const titleRow = await queryOne<{ title: string | null }>(
    `SELECT title FROM news_articles WHERE slug = $1 LIMIT 1`,
    [updated.article_slug],
  );

  return {
    ...mapCommentRow(updated),
    articleTitle: titleRow?.title?.trim() || updated.article_slug,
  };
}

export async function deleteComment(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(`DELETE FROM article_comments WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

export async function countApprovedComments(articleSlug: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM article_comments
     WHERE article_slug = $1 AND status = 'approved'`,
    [articleSlug],
  );
  return Number(row?.count ?? 0);
}
