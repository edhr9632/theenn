"use client";

import Link from "next/link";
import { panelDiscussions } from "@/lib/data";
import { useRef } from "react";
import SectionBroadcastHeader from "./SectionBroadcastHeader";
import PanelDiscussionCard from "./PanelDiscussionCard";

export default function PanelDiscussions() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".panel-disco-card");
    const gap = 16;
    const step = card ? card.offsetWidth + gap : Math.max(280, Math.round(track.clientWidth * 0.82));
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="panel-disco-section" aria-labelledby="panel-disco-heading">
      <div className="container py-4 py-lg-5">
        <SectionBroadcastHeader
          id="panel-disco-heading"
          title="Latest Panel Discussions"
          href="/panel-discussions"
          action={
            <Link href="/panel-discussions" className="section-broadcast-action-link">
              View all panels <span aria-hidden="true">→</span>
            </Link>
          }
          className="mb-4"
        />

        <div className="panel-disco-carousel position-relative">
          <button type="button" className="panel-disco-nav panel-disco-nav--prev btn border-0 rounded-circle shadow" aria-label="Scroll panels left" onClick={() => scroll(-1)}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className="panel-disco-nav panel-disco-nav--next btn border-0 rounded-circle shadow" aria-label="Scroll panels right" onClick={() => scroll(1)}>
            <span aria-hidden="true">›</span>
          </button>

          <div className="panel-disco-track" ref={trackRef} tabIndex={0} aria-label="Panel discussions carousel">
            {panelDiscussions.map((panel) => (
              <PanelDiscussionCard key={panel.episode} panel={panel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
