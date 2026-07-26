"use client";

import { usePathname } from "next/navigation";
import EducationVoiceBrief from "@/components/EducationVoiceBrief";
import { openAskEnnOverlay } from "@/lib/askEnnOverlay";

export default function EnnAssistant() {
  const pathname = usePathname();
  const hidden =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/ask") ||
    Boolean(pathname?.match(/^\/weekly-news\/[^/]+$/));
  const showHomeVoiceBrief = pathname === "/";

  if (hidden) return null;

  return (
    <div className="enn-ai-dock">
      {showHomeVoiceBrief ? <EducationVoiceBrief /> : null}

      <button
        type="button"
        className="enn-assistant-fab"
        aria-label="Open Ask ENN"
        onClick={() => openAskEnnOverlay()}
      >
        <span className="enn-assistant-fab-icon" aria-hidden="true">
          ✦
        </span>
        <span className="enn-assistant-fab-label">Ask ENN</span>
      </button>
    </div>
  );
}

/** @deprecated Use openAskEnnOverlay — kept for any legacy callers. */
export function openEnnAssistant() {
  openAskEnnOverlay();
}
