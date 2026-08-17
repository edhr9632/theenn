"use client";

import type { AssistantLink } from "@/lib/ennAssistantBrain";
import { renderInlineMarkdownParts } from "@/lib/askEnnRender";

export type AskEnnBriefSection = {
  id: string;
  title: string;
  kind: "happening" | "matters" | "learn" | "takeaways" | "report" | "other";
  paragraphs: string[];
  bullets: string[];
};

const SECTION_HEADINGS: { pattern: RegExp; kind: AskEnnBriefSection["kind"]; title: string }[] = [
  { pattern: /^what'?s happening$/i, kind: "happening", title: "What's happening" },
  { pattern: /^why it matters for education$/i, kind: "matters", title: "Why it matters for education" },
  { pattern: /^what you can learn \(quick take\)$/i, kind: "learn", title: "What you can learn (quick take)" },
  { pattern: /^highlights$/i, kind: "learn", title: "Highlights" },
  { pattern: /^keywords$/i, kind: "takeaways", title: "Keywords" },
  { pattern: /^key takeaways$/i, kind: "takeaways", title: "Key takeaways" },
  { pattern: /^read the full enn report$/i, kind: "report", title: "Read the full ENN report" },
];

export function parseAskEnnBrief(content: string): {
  title: string;
  meta: string;
  sections: AskEnnBriefSection[];
} {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  let meta = "";
  const sections: AskEnnBriefSection[] = [];
  let current: AskEnnBriefSection | null = null;
  let seenHeading = false;
  let prefaceLines: string[] = [];

  const pushCurrent = () => {
    if (current) sections.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const heading = SECTION_HEADINGS.find((item) => item.pattern.test(line));
    if (heading) {
      if (!seenHeading && prefaceLines.length) {
        title = prefaceLines[0] ?? "";
        meta = prefaceLines[1] ?? "";
        prefaceLines = [];
      }
      seenHeading = true;
      pushCurrent();
      current = { id: `${heading.kind}-${sections.length}`, title: heading.title, kind: heading.kind, paragraphs: [], bullets: [] };
      continue;
    }

    if (!seenHeading) {
      prefaceLines.push(line);
      continue;
    }

    if (!current) {
      current = { id: `other-${sections.length}`, title: "Overview", kind: "other", paragraphs: [], bullets: [] };
    }

    if (/^[-•]\s+/.test(line) || /^(Focus area|Published|Read time|Bottom line):/i.test(line)) {
      current.bullets.push(line.replace(/^[-•]\s+/, ""));
    } else {
      current.paragraphs.push(line);
    }
  }

  pushCurrent();

  if (!title && prefaceLines.length) {
    title = prefaceLines[0] ?? "";
    meta = prefaceLines[1] ?? "";
  }

  return { title, meta, sections };
}

function SectionIcon({ kind }: { kind: AskEnnBriefSection["kind"] }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const, "aria-hidden": true as const };
  if (kind === "learn") {
    return (
      <svg {...common}>
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4.5 9.9c-.9.8-1.5 1.9-1.5 3.1h-6c0-1.2-.6-2.3-1.5-3.1A6 6 0 0 1 12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "takeaways") {
    return (
      <svg {...common}>
        <path d="M12 3l2.4 5.7L21 10l-4.5 3.9L17.8 21 12 17.8 6.2 21l1.3-7.1L3 10l6.6-1.3L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "report") {
    return (
      <svg {...common}>
        <path d="M10 14l4-4M8.5 11.5l-1.2 1.2a3.2 3.2 0 0 0 4.5 4.5l1.2-1.2M15.5 12.5l1.2-1.2a3.2 3.2 0 0 0-4.5-4.5L11 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5zm8-2.5h5.5A2.5 2.5 0 0 1 20 5.5v16a2.5 2.5 0 0 0-2.5-2.5H12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3h6l4 4v14H8V3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 3v4h4M10 12h6M10 16h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

type AskEnnAnswerCardProps = {
  content: string;
  links?: AssistantLink[];
  suggestions?: string[];
  onOpenLink: (link: AssistantLink) => void;
  onAsk: (text: string) => void;
};

export default function AskEnnAnswerCard({
  content,
  links,
  suggestions,
  onOpenLink,
  onAsk,
}: AskEnnAnswerCardProps) {
  const brief = parseAskEnnBrief(content);
  const primaryLink = links?.[0];

  return (
    <article className="ask-enn-answer-card">
      {brief.title ? (
        <header className="ask-enn-answer-head">
          <h2 className="ask-enn-answer-title mb-0">{brief.title}</h2>
          {brief.meta ? <p className="ask-enn-answer-meta mb-0">{brief.meta}</p> : null}
        </header>
      ) : null}

      {brief.sections.length ? (
        <div className="ask-enn-answer-timeline">
          {brief.sections.map((section) => (
            <section key={section.id} className={`ask-enn-answer-step ask-enn-answer-step--${section.kind}`}>
              <div className="ask-enn-answer-step-rail" aria-hidden="true">
                <span className="ask-enn-answer-step-dot">
                  <SectionIcon kind={section.kind} />
                </span>
              </div>
              <div className="ask-enn-answer-step-body">
                <h3 className="ask-enn-answer-step-title mb-0">{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="ask-enn-answer-step-copy mb-0">
                    {renderInlineMarkdownParts(paragraph)}
                  </p>
                ))}
                {section.bullets.length ? (
                  <ul className="ask-enn-answer-step-list mb-0">
                    {section.bullets.map((item) => (
                      <li key={item}>{renderInlineMarkdownParts(item)}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="ask-enn-answer-fallback">{renderInlineMarkdownParts(content)}</div>
      )}

      {primaryLink ? (
        <button
          type="button"
          className="ask-enn-answer-story"
          onClick={() => onOpenLink(primaryLink)}
        >
          <span className="ask-enn-answer-story-icon" aria-hidden="true">
            <DocIcon />
          </span>
          <span className="ask-enn-answer-story-copy">
            <strong>{primaryLink.title}</strong>
            {primaryLink.meta ? <small>{primaryLink.meta}</small> : null}
          </span>
          <span className="ask-enn-answer-story-chevron" aria-hidden="true">
            ›
          </span>
        </button>
      ) : null}

      {links && links.length > 1 ? (
        <div className="ask-enn-answer-more-links">
          {links.slice(1).map((link) => (
            <button key={link.href} type="button" className="ask-enn-answer-more-link" onClick={() => onOpenLink(link)}>
              {link.title}
            </button>
          ))}
        </div>
      ) : null}

      {suggestions?.length ? (
        <div className="ask-enn-answer-chips">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => onAsk(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
