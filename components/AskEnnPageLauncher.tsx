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
    openAskEnnOverlay(q || undefined);
  }, []);

  return null;
}
