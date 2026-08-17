"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type ArticleAskAiProps = {
  slug: string;
  articleTitle: string;
  suggestions: string[];
  keywords?: string[];
  variant?: "page" | "panel";
  headingId?: string;
  autoFocus?: boolean;
};

type AskMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  grounded?: boolean;
};

export default function ArticleAskAi({
  slug,
  articleTitle,
  suggestions,
  keywords = [],
  variant = "page",
  headingId = "article-ask-ai-heading",
  autoFocus = false,
}: ArticleAskAiProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AskMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputId = `article-ask-${slug}-${variant}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) {
      window.setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [autoFocus]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const ask = useCallback(
    async (rawQuestion: string) => {
      const q = rawQuestion.trim();
      if (!q || loading) return;

      setError("");
      setLoading(true);
      setQuestion("");
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: q }]);

      try {
        const response = await fetch(`/api/news/${encodeURIComponent(slug)}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        });
        const data = (await response.json()) as {
          error?: string;
          answer?: string;
          grounded?: boolean;
        };

        if (!response.ok) {
          setError(data.error ?? "Could not get an answer.");
          setMessages((prev) => [
            ...prev,
            {
              id: `a-err-${Date.now()}`,
              role: "assistant",
              content: data.error ?? "Sorry — I could not answer that just now.",
              grounded: false,
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.answer ?? "No answer available.",
            grounded: Boolean(data.grounded),
          },
        ]);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
        window.setTimeout(() => inputRef.current?.focus(), 40);
      }
    },
    [loading, slug],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(question);
  };

  return (
    <section className={`article-ask-ai article-ask-ai--${variant}`} aria-labelledby={headingId}>
      <div className="article-ask-ai-top">
        <div className="article-ask-ai-head">
          <div className="article-ask-ai-badge" aria-hidden="true">
            AI
          </div>
          <div>
            <p className="article-ask-ai-eyebrow mb-1">Ask AI</p>
            <h2 id={headingId} className="article-ask-ai-title serif-headline mb-0">
              Ask about this article
            </h2>
          </div>
        </div>

        {suggestions.length ? (
          <div className="article-ask-ai-chips" role="list" aria-label="Suggested questions">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="article-ask-ai-chip"
                role="listitem"
                disabled={loading}
                onClick={() => void ask(item)}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="article-ask-ai-thread" aria-live="polite">
        {messages.length === 0 ? (
          <div className="article-ask-ai-empty-card">
            <p className="article-ask-ai-empty mb-0">
              Type a question below, or tap a suggestion. Answers come from this article only
              {keywords.length ? `, with highlights and keywords such as ${keywords.slice(0, 4).join(", ")}.` : "."}
            </p>
          </div>
        ) : (
          <ul className="article-ask-ai-list list-unstyled mb-0">
            {messages.map((msg) => (
              <li key={msg.id} className={`article-ask-ai-msg article-ask-ai-msg--${msg.role}`}>
                <div className="article-ask-ai-bubble">
                  <span className="article-ask-ai-msg-label">
                    {msg.role === "user" ? "You" : "Ask AI"}
                    {msg.role === "assistant" && msg.grounded ? (
                      <span className="article-ask-ai-grounded">From this article</span>
                    ) : null}
                  </span>
                  <p className="article-ask-ai-msg-text mb-0">{msg.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {loading ? (
          <p className="article-ask-ai-loading mb-0" role="status">
            Thinking…
          </p>
        ) : null}
        <div ref={threadEndRef} />
      </div>

      <div className="article-ask-ai-composer">
        <form className="article-ask-ai-form" onSubmit={onSubmit}>
          <label className="visually-hidden" htmlFor={inputId}>
            Ask a question about this article
          </label>
          <input
            ref={inputRef}
            id={inputId}
            className="article-ask-ai-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question…"
            maxLength={400}
            disabled={loading}
            autoComplete="off"
          />
          <button type="submit" className="article-ask-ai-submit" disabled={loading || !question.trim()}>
            Send
          </button>
        </form>
        {error ? (
          <p className="article-ask-ai-error mb-0 mt-2" role="alert">
            {error}
          </p>
        ) : null}
        <p className="article-ask-ai-footnote mb-0">
          Grounded in “{articleTitle.length > 72 ? `${articleTitle.slice(0, 72)}…` : articleTitle}”
        </p>
      </div>
    </section>
  );
}
