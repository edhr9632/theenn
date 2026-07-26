"use client";

import { openAskEnnOverlay } from "@/lib/askEnnOverlay";

type SiteSearchButtonProps = {
  asTopBarLink?: boolean;
};

export default function SiteSearchButton({ asTopBarLink = false }: SiteSearchButtonProps) {
  if (asTopBarLink) {
    return (
      <button
        type="button"
        className="btn btn-link link-light link-underline-opacity-0 link-underline-opacity-100-hover px-0 py-0 survey-topbar-link"
        onClick={() => openAskEnnOverlay()}
      >
        Ask ENN
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-link text-decoration-none p-2"
      aria-label="Ask ENN — search education news"
      onClick={() => openAskEnnOverlay()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-search text-navy" viewBox="0 0 16 16">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
      </svg>
    </button>
  );
}
