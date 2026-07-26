"use client";

import { useEffect, useState } from "react";
import ArticleAskAi from "@/components/ArticleAskAi";

type ArticleAskAiFloatProps = {
  slug: string;
  articleTitle: string;
  suggestions: string[];
};

export default function ArticleAskAiFloat({ slug, articleTitle, suggestions }: ArticleAskAiFloatProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle("article-ask-float-open", open);
    return () => document.body.classList.remove("article-ask-float-open");
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`article-ask-float-tab${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls="article-ask-float-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="article-ask-float-tab-text">Ask about this article with AI</span>
      </button>

      {open ? (
        <button
          type="button"
          className="article-ask-float-backdrop"
          aria-label="Close Ask AI panel"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id="article-ask-float-panel"
        className={`article-ask-float-panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Ask about this article with AI"
        hidden={!open}
      >
        <div className="article-ask-float-panel-top">
          <div>
            <p className="article-ask-float-panel-label mb-0">Ask AI</p>
            <p className="article-ask-float-panel-sub mb-0">Questions about this article</p>
          </div>
          <button
            type="button"
            className="article-ask-float-close"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="article-ask-float-panel-body">
          {open ? (
            <ArticleAskAi
              slug={slug}
              articleTitle={articleTitle}
              suggestions={suggestions}
              variant="panel"
              headingId="article-ask-float-heading"
              autoFocus
            />
          ) : null}
        </div>
      </aside>
    </>
  );
}
