"use client";

import { useEffect, useState } from "react";
import type { AskEnnTrendingPrompt } from "@/lib/askEnnSuggestions";
import AskEnnBar from "./AskEnnBar";

export default function SiteAskEnnBar() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/ask-enn/prompts")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { prompts?: AskEnnTrendingPrompt[] } | null) => {
        if (cancelled || !data?.prompts?.length) return;
        setSuggestions(data.prompts.map((prompt) => prompt.query));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="site-ask-enn-strip" aria-label="Ask ENN search">
      <div className="container-fluid px-3 px-lg-4">
        <AskEnnBar suggestions={suggestions} />
      </div>
    </section>
  );
}
