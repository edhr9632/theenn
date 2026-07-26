"use client";

import { requestEducationVoiceBrief } from "@/lib/educationVoiceBrief";

export default function HomeListenNewsButton() {
  return (
    <button
      type="button"
      className="home-listen-news-btn"
      onClick={() => requestEducationVoiceBrief()}
      aria-label="Listen to today's top education news"
    >
      <span className="home-listen-news-icon" aria-hidden="true">
        ▶
      </span>
      Listen news
    </button>
  );
}
