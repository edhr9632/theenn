"use client";

import { useEffect } from "react";
import { openAskEnnOverlay } from "@/lib/askEnnOverlay";

/** Opens the Ask ENN full-page overlay when visiting /ask (SEO landing). */
export default function AskEnnPageLauncher() {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q")?.trim();
    if (window.location.search) {
      window.history.replaceState(null, "", "/ask");
    }
    // Defer so AskEnnOverlay can attach its listener in the same tick cycle.
    const timer = window.setTimeout(() => openAskEnnOverlay(q || undefined), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
