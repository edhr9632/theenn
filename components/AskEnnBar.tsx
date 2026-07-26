"use client";

import { useEffect, useRef, useState } from "react";
import { openAskEnnOverlay } from "@/lib/askEnnOverlay";

type AskEnnBarProps = {
  suggestions: string[];
};

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

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="ask-enn-brand-mark" aria-hidden="true">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.2c3.1 0 5.6 2.1 5.6 4.7 0 1.7-1 3.2-2.6 4.1L12.4 14l-3.2-1.7c-.4.05-.8.08-1.2.08C4.9 12.38 2.4 10.3 2.4 7.7 2.4 5.1 4.9 1.2 8 1.2z"
          fill="#e11d2e"
        />
        <circle cx="6.2" cy="7.2" r="0.9" fill="#fff" />
        <circle cx="8.1" cy="7.2" r="0.9" fill="#fff" />
        <circle cx="10" cy="7.2" r="0.9" fill="#fff" />
      </svg>
    </span>
  );
}

export default function AskEnnBar({ suggestions }: AskEnnBarProps) {
  const [barValue, setBarValue] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!barRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const goAsk = (query?: string) => {
    const text = (query ?? barValue).trim();
    setSuggestionsOpen(false);
    openAskEnnOverlay(text || undefined);
    setBarValue("");
  };

  const hasText = barValue.trim().length > 0;

  return (
    <div className={`ask-enn${focused || hasText ? " is-active" : ""}`} ref={barRef}>
      <form
        className="ask-enn-bar"
        onSubmit={(event) => {
          event.preventDefault();
          goAsk();
        }}
      >
        <button type="button" className="ask-enn-brand" onClick={() => openAskEnnOverlay()} aria-label="Open askENN">
          <span className="ask-enn-brand-ask">ask</span>
          <span className="ask-enn-brand-enn">ENN</span>
          <BrandMark />
        </button>
        <span className="ask-enn-divider" aria-hidden="true" />
        <input
          className="ask-enn-input"
          value={barValue}
          onChange={(event) => {
            const next = event.target.value;
            setBarValue(next);
            setSuggestionsOpen(next.trim().length > 0);
          }}
          onFocus={() => {
            setFocused(true);
            if (barValue.trim().length > 0) setSuggestionsOpen(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder="Search news or ask a question"
          aria-label="Search news or ask a question"
        />
        <button
          type="submit"
          className={`ask-enn-submit${hasText ? " is-ready" : ""}`}
          aria-label="Open Ask ENN"
        >
          <ArrowIcon />
        </button>
      </form>

      {suggestionsOpen && hasText && suggestions.length ? (
        <div className="ask-enn-suggestions" role="listbox" aria-label="Suggested questions from ENN news">
          <p className="ask-enn-suggestions-label mb-0">Suggested from ENN news</p>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="ask-enn-suggestion"
              role="option"
              onClick={() => goAsk(suggestion)}
            >
              <span className="ask-enn-suggestion-icon">
                <SparkleIcon />
              </span>
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
