"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import type { ArticleComment } from "@/lib/commentTypes";

type ArticleCommentsProps = {
  slug: string;
  initialComments: ArticleComment[];
};

function formatCommentDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  // Fixed timezone + manual assembly avoids Node vs browser locale mismatches.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const day = get("day").replace(/^0/, "");
  const month = get("month");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");
  const dayPeriod = get("dayPeriod").toLowerCase();
  return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ArticleComments({ slug, initialComments }: ArticleCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const countLabel = useMemo(() => {
    const n = comments.length;
    return n === 1 ? "1 comment" : `${n} comments`;
  }, [comments.length]);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");
      setSuccess("");
      setSubmitting(true);

      try {
        const response = await fetch(`/api/news/${encodeURIComponent(slug)}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorName: authorName.trim(),
            authorEmail: authorEmail.trim() || undefined,
            body: body.trim(),
          }),
        });

        const data = (await response.json()) as { error?: string; comment?: ArticleComment };
        if (!response.ok) {
          setError(data.error ?? "Could not post comment.");
          return;
        }

        setBody("");
        setAuthorName("");
        setAuthorEmail("");
        setSuccess(
          "Thank you! Your comment was submitted and is waiting for admin approval before it appears on this article.",
        );
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [authorEmail, authorName, body, slug],
  );

  return (
    <section className="article-comments" aria-labelledby="article-comments-heading">
      <div className="article-comments-head">
        <h2 id="article-comments-heading" className="article-comments-title serif-headline h5 mb-0">
          Comments
        </h2>
        <span className="article-comments-count">{countLabel}</span>
      </div>

      <form className="article-comment-form" onSubmit={onSubmit}>
        <p className="article-comment-form-lead mb-3">
          Join the conversation. Share your thoughts on this story.
        </p>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="article-comment-label" htmlFor={`comment-name-${slug}`}>
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              id={`comment-name-${slug}`}
              className="article-comment-input"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              required
              minLength={2}
              maxLength={80}
              disabled={submitting}
            />
          </div>
          <div className="col-md-6">
            <label className="article-comment-label" htmlFor={`comment-email-${slug}`}>
              Email <span className="text-muted">(optional)</span>
            </label>
            <input
              id={`comment-email-${slug}`}
              type="email"
              className="article-comment-input"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={submitting}
            />
          </div>
          <div className="col-12">
            <label className="article-comment-label" htmlFor={`comment-body-${slug}`}>
              Comment <span aria-hidden="true">*</span>
            </label>
            <textarea
              id={`comment-body-${slug}`}
              className="article-comment-textarea"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your comment…"
              required
              minLength={10}
              maxLength={2000}
              disabled={submitting}
            />
          </div>
        </div>

        {error ? (
          <p className="article-comment-alert article-comment-alert-error mb-0 mt-3" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="article-comment-alert article-comment-alert-success mb-0 mt-3" role="status">
            {success}
          </p>
        ) : null}

        <button type="submit" className="article-comment-submit mt-3" disabled={submitting}>
          {submitting ? "Posting…" : "Post comment"}
        </button>
      </form>

      <div className="article-comment-list">
        {comments.length === 0 ? (
          <p className="article-comment-empty mb-0">No comments yet. Be the first to share your view.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {comments.map((comment) => (
              <li key={comment.id} className="article-comment-item">
                <div className="article-comment-avatar" aria-hidden="true">
                  {initials(comment.authorName)}
                </div>
                <div className="article-comment-body-wrap">
                  <div className="article-comment-meta">
                    <strong className="article-comment-author">{comment.authorName}</strong>
                    <time className="article-comment-date" dateTime={comment.createdAt} suppressHydrationWarning>
                      {formatCommentDate(comment.createdAt)}
                    </time>
                  </div>
                  <p className="article-comment-text mb-0">{comment.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
