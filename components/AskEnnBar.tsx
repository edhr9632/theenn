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

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function BrandBubble() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5.5" fill="#e11d2e" />
      <path
        d="M3.2 4.4c0-.9 1.2-1.6 2.8-1.6s2.8.7 2.8 1.6c0 .9-1.2 1.6-2.8 1.6-.4 0-.7-.06-1-.15L3.4 7.8l.3-1.6c-.3-.3-.5-.7-.5-1.2z"
        fill="#fff"
      />
    </svg>
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
        <button type="button" className="ask-enn-brand-badge" onClick={() => openAskEnnOverlay()} aria-label="Open askENN">
          <span className="ask-enn-brand-badge-top">
            <span className="ask-enn-brand-badge-ask">ask</span>
            <BrandBubble />
          </span>
          <span className="ask-enn-brand-badge-enn">ENN</span>
        </button>

        <span className="ask-enn-divider" aria-hidden="true" />

        <span className="ask-enn-search-icon" aria-hidden="true">
          <SearchIcon />
        </span>

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
          placeholder="Search news or ask a question..."
          aria-label="Search news or ask a question"
        />

        <button type="button" className="ask-enn-ai-btn" onClick={() => goAsk()}>
          <SparkleIcon />
          <span>Get AI Answers</span>
        </button>

        <button type="submit" className="ask-enn-submit" aria-label="Open Ask ENN">
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
