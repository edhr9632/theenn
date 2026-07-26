export type ArticleComment = {
  id: string;
  articleSlug: string;
  authorName: string;
  authorEmail: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type AdminArticleComment = ArticleComment & {
  articleTitle: string;
};

export type ArticleCommentInput = {
  authorName: string;
  authorEmail?: string;
  body: string;
};
