"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { AssistantLink } from "@/lib/ennAssistantBrain";
import { requestEducationVoiceBrief } from "@/lib/educationVoiceBrief";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: AssistantLink[];
  suggestions?: string[];
};

type AskEnnChatAppProps = {
  suggestions: string[];
};

function renderMarkdownLite(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const body = paragraph.join(" ").trim();
    paragraph = [];
    if (!body) return;
    nodes.push(
      <p key={`p-${key++}`} className="ask-enn-md-p">
        {renderInlineMarkdown(body)}
      </p>,
    );
  };

  const flushList = () => {
    if (!listItems.length) return;
    const items = [...listItems];
    listItems = [];
    nodes.push(
      <ul key={`ul-${key++}`} className="ask-enn-md-list">
        {items.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    if (/^##\s+/.test(line)) {
      flushList();
      flushParagraph();
      nodes.push(
        <h3 key={`h-${key++}`} className="ask-enn-md-h">
          {line.replace(/^##\s+/, "")}
        </h3>,
      );
      continue;
    }

    if (
      /^(What's happening|Why it matters for education|Key takeaways|Read the full ENN report)$/i.test(
        line,
      )
    ) {
      flushList();
      flushParagraph();
      nodes.push(
        <h3 key={`h-${key++}`} className="ask-enn-md-h">
          {line}
        </h3>,
      );
      continue;
    }

    if (/^[-•]\s+/.test(line)) {
      flushParagraph();
      listItems.push(line.replace(/^[-•]\s+/, ""));
      continue;
    }

    if (/^(Focus area|Published|Read time|Bottom line):/i.test(line)) {
      flushParagraph();
      listItems.push(line);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushList();
  flushParagraph();
  return nodes;
}

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5l1.4 5.1L18.5 9 13.4 10.4 12 15.5l-1.4-5.1L5.5 9l5.1-1.4L12 2.5zm7.5 11.2l.7 2.5 2.5.7-2.5.7-.7 2.5-.7-2.5-2.5-.7 2.5-.7.7-2.5zM5.2 14.8l.55 1.9 1.9.55-1.9.55-.55 1.9-.55-1.9-1.9-.55 1.9-.55.55-1.9z"
      />
    </svg>
  );
}

function UpArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 7v5l3 2M4.5 12a7.5 7.5 0 1 0 1.7-4.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 5.5V9h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BROWSE_TOPICS = [
  { label: "Daily news", prompt: "Daily news" },
  { label: "Weekly news", prompt: "Weekly news" },
  { label: "Podcast", prompt: "Podcast" },
] as const;

export default function AskEnnChatApp({ suggestions }: AskEnnChatAppProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const bootstrapped = useRef(false);

  const historyItems = messages.filter((message) => message.role === "user");

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, loading]);

  const sendMessage = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;

    setShowHistory(false);
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      },
    ]);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: { path: "/ask" },
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
            "I couldn't find a matching story on Education News Network. Try another education topic from our site.",
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
          content: "Something went wrong while searching ENN website content. Please try again.",
          suggestions: ["Daily news", "Weekly news", "Podcast"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const openAssistantLink = useCallback(
    (link: AssistantLink) => {
      const newsMatch = link.href.match(/^\/news\/([^/?#]+)/);
      if (newsMatch) {
        if (/^Read full story:/i.test(link.title)) {
          window.open(link.href, "_blank", "noopener,noreferrer");
          return;
        }
        const title = link.title.replace(/^Read full story:\s*/i, "").trim();
        void sendMessage(`What should I know about: ${title}`);
        return;
      }
      if (link.href === "/news" || link.href === "/trending-news") {
        void sendMessage(link.href === "/trending-news" ? "Trending news" : "Daily news");
        return;
      }
      window.open(link.href, "_blank", "noopener,noreferrer");
    },
    [sendMessage],
  );

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    let pending = "";
    if (typeof window !== "undefined") {
      const fromUrl = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
      if (window.location.search) {
        window.history.replaceState(null, "", "/ask");
      }
      try {
        pending = fromUrl || localStorage.getItem("askenn-pending-query")?.trim() || "";
        if (localStorage.getItem("askenn-pending-query")) {
          localStorage.removeItem("askenn-pending-query");
        }
      } catch {
        pending = fromUrl;
      }
    }

    if (pending) void sendMessage(pending);
  }, [sendMessage]);

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setShowHistory(false);
    bootstrapped.current = true;
  };

  return (
    <div className="ask-enn-overlay ask-enn-overlay--page" role="main" aria-label="Ask ENN chat">
      <aside className="ask-enn-sidebar">
            <div className="ask-enn-sidebar-brand">
              <Link href="/" className="ask-enn-sidebar-home">
                <Image
                  src="/images/Enn_logo1.png"
                  alt="Education News Network"
                  width={168}
                  height={52}
                  className="ask-enn-sidebar-logo-img"
                  priority
                />
              </Link>
            </div>

        <nav className="ask-enn-sidebar-nav" aria-label="askENN menu">
          <button type="button" className="ask-enn-sidebar-btn" onClick={startNewChat}>
            <PlusIcon />
            <span>New chat</span>
          </button>
          <button
            type="button"
            className={`ask-enn-sidebar-btn${showHistory ? " is-active" : ""}`}
            onClick={() => setShowHistory((prev) => !prev)}
          >
            <HistoryIcon />
            <span>History</span>
          </button>
        </nav>

        {showHistory ? (
          <div className="ask-enn-sidebar-history">
            <p className="ask-enn-sidebar-history-label mb-0">This session</p>
            {historyItems.length ? (
              <ul className="ask-enn-sidebar-history-list list-unstyled mb-0">
                {historyItems.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="ask-enn-sidebar-history-item" onClick={() => setShowHistory(false)}>
                      {item.content}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ask-enn-sidebar-history-empty mb-0">No questions yet.</p>
            )}
          </div>
        ) : null}

        <div className="ask-enn-sidebar-spacer" />
      </aside>

      <div className="ask-enn-chat">
        <header className="ask-enn-chat-head">
          <div>
                <p className="ask-enn-chat-kicker mb-0">Education News Network</p>
                <h1 className="ask-enn-chat-title mb-0">askENN</h1>
              </div>
          <Link href="/" className="ask-enn-chat-close" aria-label="Back to ENN home">
            ✕
          </Link>
        </header>

        <div className="ask-enn-chat-messages" ref={listRef}>
          {!messages.length && !loading ? (
                <div className="ask-enn-chat-empty">
                  <div className="ask-enn-chat-empty-card">
                    <p className="ask-enn-chat-empty-title mb-1">Ask anything about ENN education news</p>
                    <p className="ask-enn-chat-empty-copy mb-0">
                      Tap Daily news, Weekly news, or Podcast to see every story in that section — or pick a headline
                      below for a full briefing.
                    </p>
                  </div>
                  <div className="ask-enn-browse" role="group" aria-label="Browse ENN sections">
                    {BROWSE_TOPICS.map((topic) => (
                      <button
                        key={topic.prompt}
                        type="button"
                        className="ask-enn-browse-btn"
                        onClick={() => void sendMessage(topic.prompt)}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                  <p className="ask-enn-chat-empty-label mb-0">Or ask about a headline</p>
                  <div className="ask-enn-chat-empty-suggestions">
                    {suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)}>
                        <SparkleIcon />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
          ) : null}

          {messages.map((message) => (
            <div key={message.id} className={`ask-enn-bubble ask-enn-bubble--${message.role}`}>
              <div className="ask-enn-bubble-text">{renderMarkdownLite(message.content)}</div>
              {message.links?.length ? (
                <ul className="ask-enn-bubble-links list-unstyled mb-0 mt-2">
                  {message.links.map((link) => (
                    <li key={`${message.id}-${link.href}`}>
                      <button
                        type="button"
                        className="ask-enn-bubble-link"
                        onClick={() => openAssistantLink(link)}
                        aria-label={`Summarize: ${link.title}`}
                      >
                        <span>{link.title}</span>
                        {link.meta ? <small>{link.meta}</small> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {message.suggestions?.length ? (
                <div className="ask-enn-bubble-suggestions">
                  {message.suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {loading ? (
            <div className="ask-enn-bubble ask-enn-bubble--assistant ask-enn-bubble--loading">
              Searching ENN website content…
            </div>
          ) : null}
        </div>

        <form
          className="ask-enn-chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <div className="ask-enn-composer-browse" role="group" aria-label="Browse ENN sections">
            {BROWSE_TOPICS.map((topic) => (
              <button
                key={topic.prompt}
                type="button"
                className="ask-enn-composer-browse-btn"
                onClick={() => void sendMessage(topic.prompt)}
                disabled={loading}
              >
                {topic.label}
              </button>
            ))}
          </div>
          <div className="ask-enn-composer-row">
            <input
              className="ask-enn-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Anything about ENN news..."
              aria-label="Ask Anything about ENN news"
              disabled={loading}
            />
            <button type="submit" className="ask-enn-chat-send" aria-label="Send" disabled={loading || !input.trim()}>
              <UpArrowIcon />
            </button>
          </div>
        </form>
        <p className="ask-enn-disclaimer mb-0">
          Ask ENN summaries are generated from Education News Network reporting.{" "}
          <Link href="/contact">Share your feedback</Link>
        </p>
      </div>
    </div>
  );
}
