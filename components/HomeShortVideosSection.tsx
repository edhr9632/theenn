"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { upgradeYoutubeThumbUrl, youtubeThumb } from "@/lib/siteVideos";
import SectionBroadcastHeader from "./SectionBroadcastHeader";
import ComingSoonBlock from "./ComingSoonBlock";
import YoutubeThumbImage from "./YoutubeThumbImage";

type DbShortVideo = {
  id: string;
  title: string;
  duration: string;
  image: string;
  youtubeUrl: string;
  meta: string;
};

type ShortVideoItem = {
  id: string;
  title: string;
  image: string;
  href: string;
  external: boolean;
  meta?: string;
  duration?: string;
};

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
    </svg>
  );
}

function ShortVideoCard({ item }: { item: ShortVideoItem }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="home-shorts-card"
    >
      <span className="home-shorts-thumb">
        {item.image ? (
          item.image.startsWith("data:") || item.image.startsWith("/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt="" className="object-fit-cover" />
          ) : (
            <YoutubeThumbImage
              src={item.image}
              youtubeUrl={item.href}
              sizes="(max-width:575px) 42vw, (max-width:991px) 28vw, 200px"
            />
          )
        ) : null}
        <span className="home-shorts-play" aria-hidden="true">
          <PlayIcon size={18} />
        </span>
      </span>
      <span className="home-shorts-copy">
        <span className="home-shorts-item-title">{item.title}</span>
      </span>
    </a>
  );
}

type HomeShortVideosSectionProps = {
  dbShortVideos?: DbShortVideo[];
};

export default function HomeShortVideosSection({ dbShortVideos = [] }: HomeShortVideosSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const hoveringRef = useRef(false);
  const manualPauseUntilRef = useRef(0);

  const shorts = useMemo<ShortVideoItem[]>(() => {
    return dbShortVideos.map((item) => ({
      id: item.id,
      title: item.title,
      image: upgradeYoutubeThumbUrl(item.image || youtubeThumb(item.youtubeUrl), item.youtubeUrl),
      href: item.youtubeUrl,
      external: true,
      meta: item.meta,
      duration: item.duration,
    }));
  }, [dbShortVideos]);

  const carouselShorts = useMemo(() => {
    if (shorts.length < 2) return shorts;
    return [...shorts, ...shorts];
  }, [shorts]);

  const pauseAuto = (holdMs = 0) => {
    pausedRef.current = true;
    if (holdMs > 0) {
      manualPauseUntilRef.current = performance.now() + holdMs;
    }
  };

  const scroll = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;

    pauseAuto(3500);

    const card = track.querySelector<HTMLElement>(".home-shorts-card");
    const gap = 14;
    const step = card ? card.offsetWidth + gap : Math.max(160, Math.round(track.clientWidth * 0.42));
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    const track = trackRef.current;
    const carousel = carouselRef.current;
    if (!track || !carousel || shorts.length < 2) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      if (pausedRef.current) {
        if (
          !hoveringRef.current &&
          manualPauseUntilRef.current > 0 &&
          now >= manualPauseUntilRef.current
        ) {
          pausedRef.current = false;
          manualPauseUntilRef.current = 0;
        }
      } else {
        const delta = Math.min(now - last, 32);
        track.scrollLeft += delta * 0.045;
        const loopWidth = track.scrollWidth / 2;
        if (loopWidth > 0 && track.scrollLeft >= loopWidth) {
          track.scrollLeft -= loopWidth;
        }
      }
      last = now;
      frame = window.requestAnimationFrame(tick);
    };

    const pause = () => {
      pauseAuto();
    };
    const resume = () => {
      pausedRef.current = false;
      manualPauseUntilRef.current = 0;
      last = performance.now();
    };
    const onMouseEnter = () => {
      hoveringRef.current = true;
      pause();
    };
    const onMouseLeave = () => {
      hoveringRef.current = false;
      resume();
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && carousel.contains(next)) return;
      resume();
    };
    const onTouchEnd = () => {
      pauseAuto(2500);
    };

    carousel.addEventListener("mouseenter", onMouseEnter);
    carousel.addEventListener("mouseleave", onMouseLeave);
    carousel.addEventListener("focusin", pause);
    carousel.addEventListener("focusout", onFocusOut);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      carousel.removeEventListener("mouseenter", onMouseEnter);
      carousel.removeEventListener("mouseleave", onMouseLeave);
      carousel.removeEventListener("focusin", pause);
      carousel.removeEventListener("focusout", onFocusOut);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("touchend", onTouchEnd);
    };
  }, [shorts.length]);

  return (
    <section className="home-shorts-section" aria-labelledby="home-shorts-heading">
      <div className="container py-4 py-lg-5">
        <SectionBroadcastHeader
          id="home-shorts-heading"
          title="Short Videos"
          href="/panel-discussions"
          action={
            <Link href="/panel-discussions" className="section-broadcast-action-link">
              View all shorts <span aria-hidden="true">→</span>
            </Link>
          }
          className="mb-4"
        />

        {!shorts.length ? (
          <ComingSoonBlock
            title="Short videos coming soon"
            message="Add short clips in Admin → Shorts when your database is configured."
          />
        ) : (
          <div className="home-shorts-carousel position-relative" ref={carouselRef}>
            {shorts.length > 1 ? (
              <>
                <button
                  type="button"
                  className="home-shorts-nav home-shorts-nav--prev btn border-0 rounded-circle shadow"
                  aria-label="Scroll short videos left"
                  onClick={() => scroll(-1)}
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  type="button"
                  className="home-shorts-nav home-shorts-nav--next btn border-0 rounded-circle shadow"
                  aria-label="Scroll short videos right"
                  onClick={() => scroll(1)}
                >
                  <span aria-hidden="true">›</span>
                </button>
              </>
            ) : null}

            <div
              className="home-shorts-track"
              ref={trackRef}
              tabIndex={0}
              aria-label="Short videos carousel"
            >
              {carouselShorts.map((item, index) => (
                <ShortVideoCard key={`${item.id}-${index}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
