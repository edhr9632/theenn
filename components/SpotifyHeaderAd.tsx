"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  ADS_AUTOPLAY_MS,
  DEFAULT_SITE_ADS,
  readSiteAds,
  type SiteAdSlide,
  type SiteAdsConfig,
} from "@/lib/siteAds";

/** Static coords — avoids SSR/client float mismatches from Math.cos/sin. */
const BURST_LINES = [
  { x1: 90, y1: 60, x2: 112, y2: 60, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 89.63, y1: 64.69, x2: 114.32, y2: 68.6, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 88.53, y1: 69.27, x2: 115.16, y2: 77.92, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 86.73, y1: 73.62, x2: 106.33, y2: 83.61, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 84.27, y1: 77.63, x2: 104.5, y2: 92.33, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 81.21, y1: 81.21, x2: 101.01, y2: 101.01, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 77.63, y1: 84.27, x2: 90.56, y2: 102.07, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 73.62, y1: 86.73, x2: 84.97, y2: 109.01, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 69.27, y1: 88.53, x2: 77.92, y2: 115.16, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 64.69, y1: 89.63, x2: 68.13, y2: 111.36, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 60, y1: 90, x2: 60, y2: 115, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 55.31, y1: 89.63, x2: 50.93, y2: 117.29, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 50.73, y1: 88.53, x2: 43.93, y2: 109.45, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 46.38, y1: 86.73, x2: 35.03, y2: 109.01, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 42.37, y1: 84.27, x2: 25.91, y2: 106.92, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 38.79, y1: 81.21, x2: 23.23, y2: 96.77, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 35.73, y1: 77.63, x2: 15.5, y2: 92.33, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 33.27, y1: 73.62, x2: 8.32, y2: 86.33, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 31.47, y1: 69.27, x2: 10.55, y2: 76.07, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 30.37, y1: 64.69, x2: 5.68, y2: 68.6, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 30, y1: 60, x2: 2, y2: 60, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 30.37, y1: 55.31, x2: 8.64, y2: 51.87, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 31.47, y1: 50.73, x2: 7.69, y2: 43, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 33.27, y1: 46.38, x2: 8.32, y2: 33.67, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 35.73, y1: 42.37, x2: 17.93, y2: 29.44, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 38.79, y1: 38.79, x2: 21.11, y2: 21.11, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 42.37, y1: 35.73, x2: 25.91, y2: 13.08, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 46.38, y1: 33.27, x2: 36.39, y2: 13.67, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 50.73, y1: 31.47, x2: 43, y2: 7.69, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 55.31, y1: 30.37, x2: 50.93, y2: 2.71, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 60, y1: 30, x2: 60, y2: 8, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 64.69, y1: 30.37, x2: 68.6, y2: 5.68, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 69.27, y1: 31.47, x2: 77.92, y2: 4.84, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 73.62, y1: 33.27, x2: 83.61, y2: 13.67, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 77.63, y1: 35.73, x2: 92.33, y2: 15.5, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 81.21, y1: 38.79, x2: 101.01, y2: 18.99, strokeWidth: 1.2, opacity: 0.85 },
  { x1: 84.27, y1: 42.37, x2: 102.07, y2: 29.44, strokeWidth: 1.8, opacity: 0.55 },
  { x1: 86.73, y1: 46.38, x2: 109.01, y2: 35.03, strokeWidth: 1.2, opacity: 0.65 },
  { x1: 88.53, y1: 50.73, x2: 115.16, y2: 42.08, strokeWidth: 1.8, opacity: 0.75 },
  { x1: 89.63, y1: 55.31, x2: 111.36, y2: 51.87, strokeWidth: 1.2, opacity: 0.85 },
] as const;

const ACCENT_COLOR: Record<SiteAdSlide["accent"], string> = {
  spotify: "#1DB954",
  navy: "#1a4099",
  red: "#e11d2e",
  sky: "#0284c7",
};

const PRIMARY_CTA: Record<SiteAdSlide["accent"], string> = {
  spotify: "Listen Now",
  navy: "Read Magazine",
  red: "Learn More",
  sky: "Explore Admissions",
};

const SECONDARY_CTA: Record<SiteAdSlide["accent"], string> = {
  spotify: "Follow Now",
  navy: "Subscribe",
  red: "Get in Touch",
  sky: "Contact Us",
};

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

function BroadcastIcon({ size = 16, color = "#1DB954" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.1" fill={color} />
      <path
        d="M7.5 12a4.5 4.5 0 0 1 1.45-3.3M16.5 12a4.5 4.5 0 0 0-1.45-3.3"
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4.8 12a7.2 7.2 0 0 1 2.5-5.4M19.2 12a7.2 7.2 0 0 0-2.5-5.4"
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M2.4 12a9.6 9.6 0 0 1 3.4-7.2M21.6 12a9.6 9.6 0 0 0-3.4-7.2"
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RadiatingBadge({ color, label }: { color: string; label: string }) {
  return (
    <div className="spotify-ad-badge" aria-hidden="true">
      <svg className="spotify-ad-badge-burst" viewBox="0 0 120 120" fill="none">
        {BURST_LINES.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={color}
            strokeWidth={line.strokeWidth}
            strokeLinecap="round"
            opacity={line.opacity}
          />
        ))}
      </svg>
      <div className="spotify-ad-badge-core">
        <BroadcastIcon size={22} color={color} />
        <span>{label}</span>
      </div>
    </div>
  );
}

function ActionButtons({
  slide,
  className = "",
}: {
  slide: SiteAdSlide;
  className?: string;
}) {
  const primaryProps = isExternal(slide.listenUrl)
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  const secondaryProps = isExternal(slide.followUrl)
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <div className={`spotify-ad-actions ${className}`.trim()}>
      <a href={slide.listenUrl} className={`spotify-ad-btn spotify-ad-btn--${slide.accent}`} {...primaryProps}>
        {slide.primaryLabel || PRIMARY_CTA[slide.accent]}
      </a>
      <a
        href={slide.followUrl}
        className={`spotify-ad-btn spotify-ad-btn--${slide.accent} spotify-ad-btn--secondary`}
        {...secondaryProps}
      >
        {slide.secondaryLabel || SECONDARY_CTA[slide.accent]}
      </a>
    </div>
  );
}

function SpotifySlide({ slide }: { slide: SiteAdSlide }) {
  const color = ACCENT_COLOR.spotify;
  return (
    <div className="spotify-ad-banner spotify-ad-banner--spotify">
      <div className="spotify-ad-left">
        <RadiatingBadge color={color} label="Spotify" />
        <div className="spotify-ad-copy">
          <p className="spotify-ad-kicker mb-0" style={{ color }}>
            <BroadcastIcon size={15} color={color} />
            {slide.kicker}
          </p>
          <p className="spotify-ad-headline mb-0">{slide.headline}</p>
          <p className="spotify-ad-sub mb-0">{slide.subtext}</p>
        </div>
      </div>
      <ActionButtons slide={slide} />
    </div>
  );
}

function BrandLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="ad-brand-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="ad-brand-logo-img" />
    </span>
  );
}

function EtMagazineSlide({ slide }: { slide: SiteAdSlide }) {
  const brand = slide.brandColor || "#1A6BC8";
  return (
    <div className="spotify-ad-banner ad-layout-et" style={{ ["--ad-brand" as string]: brand }}>
      <BrandLogo src={slide.logoUrl || "/images/brands/et-logo.webp"} alt="Education Today Magazine" />
      <div className="ad-et-body">
        <p className="ad-et-kicker mb-0">{slide.kicker}</p>
        <p className="ad-et-headline mb-0">{slide.headline}</p>
        <p className="ad-et-sub mb-0">{slide.subtext}</p>
      </div>
      <ActionButtons slide={slide} className="ad-et-actions" />
    </div>
  );
}

function MsaSlide({ slide }: { slide: SiteAdSlide }) {
  const brand = slide.brandColor || "#00AEEF";
  return (
    <div
      className="spotify-ad-banner ad-layout-msa"
      style={
        {
          ["--ad-brand" as string]: brand,
          ["--ad-brand-accent" as string]: "#F58220",
        } as CSSProperties
      }
    >
      <BrandLogo src={slide.logoUrl || "/images/brands/msa-logo.png"} alt="My School Admission" />
      <div className="ad-msa-copy">
        <p className="ad-msa-kicker mb-0">{slide.kicker}</p>
        <p className="ad-msa-headline mb-0">{slide.headline}</p>
        <div className="ad-msa-chips">
          <span>Find schools</span>
          <span>Compare</span>
          <span>Apply</span>
        </div>
        <p className="ad-msa-sub mb-0">{slide.subtext}</p>
      </div>
      <ActionButtons slide={slide} className="ad-msa-actions" />
    </div>
  );
}

function EdhrSlide({ slide }: { slide: SiteAdSlide }) {
  const brand = slide.brandColor || "#080808";
  return (
    <div className="spotify-ad-banner ad-layout-edhr" style={{ ["--ad-brand" as string]: brand }}>
      <BrandLogo src={slide.logoUrl || "/images/brands/edhr-logo.png"} alt="EDHR Recruitments" />
      <div className="ad-edhr-copy">
        <p className="ad-edhr-kicker mb-0">
          <span className="ad-edhr-dot" aria-hidden="true" />
          {slide.kicker}
        </p>
        <p className="ad-edhr-headline mb-0">{slide.headline}</p>
        <p className="ad-edhr-sub mb-0">{slide.subtext}</p>
      </div>
      <ActionButtons slide={slide} className="ad-edhr-actions" />
    </div>
  );
}

function AdSlideCard({ slide }: { slide: SiteAdSlide }) {
  if (slide.bannerImageUrl) {
    return (
      <div
        className={`spotify-ad-banner spotify-ad-banner--image spotify-ad-banner--${slide.accent}`}
        style={{ backgroundImage: `url(${slide.bannerImageUrl})` }}
      >
        <span className="visually-hidden">
          {slide.kicker} — {slide.headline}
        </span>
        <ActionButtons slide={slide} />
      </div>
    );
  }

  if (slide.accent === "spotify") return <SpotifySlide slide={slide} />;
  if (slide.accent === "navy") return <EtMagazineSlide slide={slide} />;
  if (slide.accent === "sky") return <MsaSlide slide={slide} />;
  return <EdhrSlide slide={slide} />;
}

export default function SpotifyHeaderAd() {
  const [config, setConfig] = useState<SiteAdsConfig>(DEFAULT_SITE_ADS);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConfig(readSiteAds());
    setReady(true);
  }, []);

  const slides = config.slides.length ? config.slides : DEFAULT_SITE_ADS.slides;
  const count = slides.length;
  const autoplayMs = Math.max(config.autoplayMs || ADS_AUTOPLAY_MS, ADS_AUTOPLAY_MS);

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!ready || !config.enabled || paused || count < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, autoplayMs);
    return () => window.clearInterval(timer);
  }, [ready, config.enabled, autoplayMs, paused, count]);

  if (!config.enabled) return null;

  const active = slides[index] ?? slides[0];

  return (
    <section
      className="spotify-ad-bar"
      aria-label="Featured advertisements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="spotify-ad-shell">
        <div className="spotify-ad-slider">
          <div className="spotify-ad-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {slides.map((slide) => (
              <div key={slide.id} className="spotify-ad-slide">
                <AdSlideCard slide={slide} />
              </div>
            ))}
          </div>

          {count > 1 ? (
            <>
              <button
                type="button"
                className="spotify-ad-nav spotify-ad-nav--prev"
                aria-label="Previous ad"
                onClick={() => goTo(index - 1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="spotify-ad-nav spotify-ad-nav--next"
                aria-label="Next ad"
                onClick={() => goTo(index + 1)}
              >
                ›
              </button>
              <div className="spotify-ad-dots" role="tablist" aria-label="Ad slides">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={slideIndex === index}
                    aria-label={`Show ad ${slideIndex + 1}`}
                    className={`spotify-ad-dot${slideIndex === index ? " is-active" : ""}`}
                    onClick={() => goTo(slideIndex)}
                  />
                ))}
              </div>
            </>
          ) : null}

          <span className="visually-hidden" aria-live="polite">
            {active.kicker}: {active.headline}
          </span>
        </div>
      </div>
    </section>
  );
}
