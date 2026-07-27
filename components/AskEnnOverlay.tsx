"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AssistantLink } from "@/lib/ennAssistantBrain";
import { getAskEnnTrendingPrompts } from "@/lib/askEnnSuggestions";
import {
  ASK_ENN_OPEN_EVENT,
  consumeAskEnnPendingOpen,
  type AskEnnOpenDetail,
} from "@/lib/askEnnOverlay";
import { requestEducationVoiceBrief } from "@/lib/educationVoiceBrief";
import AskEnnAnswerCard from "@/components/AskEnnAnswerCard";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: AssistantLink[];
  suggestions?: string[];
};

const WORD_LIMIT = 30;

function SparkleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5l1.4 5.1L18.5 9 13.4 10.4 12 15.5l-1.4-5.1L5.5 9l5.1-1.4L12 2.5zm7.5 11.2l.7 2.5 2.5.7-2.5.7-.7 2.5-.7-2.5-2.5-.7 2.5-.7.7-2.5zM5.2 14.8l.55 1.9 1.9.55-1.9.55-.55 1.9-.55-1.9-1.9-.55 1.9-.55.55-1.9z"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

const PROMPT_ICON_COLORS = ["#7c3aed", "#2563eb", "#db2777", "#0891b2", "#ca8a04", "#059669"] as const;

function PromptGlyph({ index }: { index: number }) {
  const icons = [
    // graduation
    <path key="g" d="M12 3L2 8l10 5 10-5-10-5zm0 8.5L4.5 8.2v4.3L12 16l7.5-3.5V8.2L12 11.5zM6 14.2v3.3L12 21l6-3.5v-3.3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />,
    // people
    <path key="p" d="M16 19v-1.2A3.8 3.8 0 0 0 12.2 14H7.8A3.8 3.8 0 0 0 4 17.8V19M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 8v-1.1a3 3 0 0 0-2.1-2.8M15.1 5.2a3 3 0 0 1 0 5.6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />,
    // heart
    <path key="h" d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />,
    // building
    <path key="b" d="M4 20h16M6 20V8l6-4 6 4v12M10 12h.01M14 12h.01M10 16h.01M14 16h.01" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    // book
    <path key="k" d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5zm8-2.5h5.5A2.5 2.5 0 0 1 20 5.5v16a2.5 2.5 0 0 0-2.5-2.5H12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />,
    // plane
    <path key="a" d="M10.5 12.5L4 9.5l1-2 7.5 2.2L18 4l2 1-3.5 8.5 2.2 7.5-2 1-3-6.5-6.5 3.5-1-2 5.3-2.5z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />,
  ];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      {icons[index % icons.length]}
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" />
    </svg>
  );
}

export default function AskEnnOverlay() {
  const pathname = usePathname();
  const hiddenOnRoute =
    pathname?.startsWith("/admin") || Boolean(pathname?.match(/^\/weekly-news\/[^/]+$/));

  const trending = getAskEnnTrendingPrompts(6);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullPageHref, setFullPageHref] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingQuery = useRef<string | null>(null);

  const resetSession = useCallback(() => {
    setInput("");
    setLoading(false);
    setFullPageHref(null);
    setMessages([]);
    pendingQuery.current = null;
  }, []);

  const showHero = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const close = useCallback(() => {
    setOpen(false);
    resetSession();
  }, [resetSession]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || loading) return;
      if (countWords(text) > WORD_LIMIT) return;

      setInput("");
      setLoading(true);
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content: text },
      ]);

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            context: { path: pathname ?? "/" },
          }),
        });

        const data = (await response.json()) as {
          message?: string;
          links?: AssistantLink[];
          suggestions?: string[];
          action?: "play-voice-brief";
          error?: string;
        };

        if (!response.ok) throw new Error(data.error || "Ask ENN failed");

        if (data.action === "play-voice-brief") {
          requestEducationVoiceBrief();
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content:
              data.message ||
              "I couldn't find a matching story on Education News Network. Try another education topic.",
            links: data.links,
            suggestions: data.suggestions,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content: "Something went wrong while searching ENN. Please try again.",
            suggestions: ["Daily news", "Weekly news", "Podcast"],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, pathname],
  );

  useEffect(() => {
    const applyOpen = (detail?: AskEnnOpenDetail | null) => {
      resetSession();
      setOpen(true);
      if (detail?.query?.trim()) {
        pendingQuery.current = detail.query.trim();
      }
    };

    const onOpen = (event: Event) => {
      consumeAskEnnPendingOpen();
      applyOpen((event as CustomEvent<AskEnnOpenDetail>).detail);
    };

    window.addEventListener(ASK_ENN_OPEN_EVENT, onOpen);
    const pending = consumeAskEnnPendingOpen();
    if (pending) applyOpen(pending);

    return () => window.removeEventListener(ASK_ENN_OPEN_EVENT, onOpen);
  }, [resetSession]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !pendingQuery.current) return;
    const query = pendingQuery.current;
    pendingQuery.current = null;
    void sendMessage(query);
  }, [open, sendMessage]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (fullPageHref) setFullPageHref(null);
        else close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, fullPageHref, close]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  if (hiddenOnRoute) return null;

  const wordCount = countWords(input);
  const overLimit = wordCount > WORD_LIMIT;
  const hasChat = messages.length > 0 || loading;

  const searchForm = (compact = false) => (
    <form
      className={`ask-enn-fp-search-wrap${compact ? " ask-enn-fp-search-wrap--compact" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (!overLimit) void sendMessage(input);
      }}
    >
      <div className={`ask-enn-fp-search-gradient${compact ? " ask-enn-fp-search-gradient--compact" : ""}`}>
        <div className="ask-enn-fp-search-inner">
          <span className="ask-enn-fp-search-icon">
            <SparkleIcon size={compact ? 14 : 16} />
          </span>
          <input
            ref={inputRef}
            className="ask-enn-fp-search-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search news or ask a question"
            aria-label="Search news or ask a question"
            disabled={loading}
          />
          <button
            type="submit"
            className="ask-enn-fp-search-send"
            disabled={loading || !input.trim() || overLimit}
            aria-label="Ask ENN"
          >
            <ArrowUpIcon />
          </button>
        </div>
      </div>
      {!compact ? (
        <p className={`ask-enn-fp-limit mb-0${overLimit ? " is-over" : ""}`}>
          Please limit your question to {WORD_LIMIT} words.
          {wordCount > 0 ? ` (${wordCount}/${WORD_LIMIT})` : ""}
        </p>
      ) : null}
    </form>
  );

  return open ? (
    <div className="ask-enn-fp-overlay" role="dialog" aria-modal="true" aria-label="Ask ENN">
      <div className="ask-enn-fp-banner" aria-hidden="true">
        {/* Native img keeps the PNG sharp (no Next image compression/downscale). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ask-enn-banner.png"
          alt=""
          className="ask-enn-fp-banner-img"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      <header className="ask-enn-fp-topbar">
        <div className="ask-enn-fp-brand">
          <Image
            src="/images/Enn_logo1.png"
            alt="Education News Network"
            width={200}
            height={56}
            className="ask-enn-fp-logo"
            priority
          />
        </div>
        <button type="button" className="ask-enn-fp-close" onClick={close} aria-label="Close">
          ✕
        </button>
      </header>

      <div className="ask-enn-fp-shell">
      <div className={`ask-enn-fp-body${hasChat ? " ask-enn-fp-body--chat" : ""}`}>
        {!hasChat ? (
          <div className="ask-enn-fp-hero">
            <div className="ask-enn-fp-hero-intro">
              <h1 className="ask-enn-fp-title">
                Welcome to ask<span className="ask-enn-fp-title-accent">ENN</span>
                <span className="ask-enn-fp-sparkle" aria-hidden="true">
                  ✦
                </span>
              </h1>
              <p className="ask-enn-fp-lead mb-0">
                Get news and articles with accuracy from Education News Network journalism.
              </p>
            </div>

            {searchForm(false)}

            <div className="ask-enn-fp-trending-block">
              <p className="ask-enn-fp-trending-label mb-0">
                <span className="ask-enn-fp-trending-bolt" aria-hidden="true">
                  <LightningIcon />
                </span>
                Trending prompts:
              </p>
              <div className="ask-enn-fp-trending" role="list">
                {trending.map((prompt, index) => (
                  <button
                    key={prompt.query}
                    type="button"
                    role="listitem"
                    className="ask-enn-fp-trending-btn"
                    onClick={() => void sendMessage(prompt.query)}
                    disabled={loading}
                    aria-label={`Ask: ${prompt.label}`}
                  >
                    <span
                      className="ask-enn-fp-trending-icon"
                      style={{ backgroundColor: `${PROMPT_ICON_COLORS[index % PROMPT_ICON_COLORS.length]}18`, color: PROMPT_ICON_COLORS[index % PROMPT_ICON_COLORS.length] }}
                    >
                      <PromptGlyph index={index} />
                    </span>
                    <span className="ask-enn-fp-trending-text">{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="ask-enn-fp-answer-view">
            <div className="ask-enn-fp-chat-head">
              <button type="button" className="ask-enn-fp-back-prompts" onClick={showHero}>
                ← Trending prompts
              </button>
            </div>
            <div className="ask-enn-fp-messages" ref={listRef}>
              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="ask-enn-fp-msg ask-enn-fp-msg--user">
                    {message.content}
                  </div>
                ) : (
                  <AskEnnAnswerCard
                    key={message.id}
                    content={message.content}
                    links={message.links}
                    suggestions={message.suggestions}
                    onOpenLink={setFullPageHref}
                    onAsk={(text) => void sendMessage(text)}
                  />
                ),
              )}
              {loading ? (
                <div className="ask-enn-fp-msg ask-enn-fp-msg--assistant ask-enn-fp-msg--loading">
                  Searching ENN website content…
                </div>
              ) : null}
            </div>

            <div className="ask-enn-fp-composer">{searchForm(true)}</div>
            <p className="ask-enn-fp-footnote mb-0">
              Ask ENN summaries are generated from Education News Network reporting.{" "}
              <Link href="/contact" onClick={close}>
                Share feedback
              </Link>
            </p>
          </div>
        )}
      </div>

      {fullPageHref ? (
        <div className="ask-enn-story-viewer" role="dialog" aria-modal="true" aria-label="Full story">
          <div className="ask-enn-story-viewer-head">
            <div className="ask-enn-story-viewer-label">Full story</div>
            <button
              type="button"
              className="ask-enn-story-viewer-close"
              onClick={() => setFullPageHref(null)}
              aria-label="Close full story"
            >
              ✕
            </button>
          </div>
          <iframe className="ask-enn-story-viewer-frame" src={fullPageHref} title="Full story" />
        </div>
      ) : null}
      </div>
    </div>
  ) : null;
}
