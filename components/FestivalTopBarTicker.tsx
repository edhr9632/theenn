"use client";

import { useEffect, useState } from "react";
import type { FestivalPopupConfig } from "@/lib/festivalPopupConfig";
import { getFestivalTopBarTicker } from "@/lib/festivalPopupConfig";

export default function FestivalTopBarTicker() {
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/festival")
      .then((response) => response.json())
      .then((data: { config?: FestivalPopupConfig | null }) => {
        if (cancelled || !data.config) return;
        setText(getFestivalTopBarTicker(data.config));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!text) return null;

  return (
    <div className="top-bar-festival-ticker" aria-label="Festival greeting">
      <div className="top-bar-festival-track" aria-hidden="true">
        <span className="top-bar-festival-segment">
          <strong>{text}</strong>
          <span className="top-bar-festival-dot">•</span>
          <strong>{text}</strong>
          <span className="top-bar-festival-dot">•</span>
        </span>
        <span className="top-bar-festival-segment">
          <strong>{text}</strong>
          <span className="top-bar-festival-dot">•</span>
          <strong>{text}</strong>
          <span className="top-bar-festival-dot">•</span>
        </span>
      </div>
      <span className="visually-hidden">{text}</span>
    </div>
  );
}
