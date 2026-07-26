"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  ADS_AUTOPLAY_MS,
  DEFAULT_SITE_ADS,
  readSiteAds,
  type SiteAdSlide,
  type SiteAdsConfig,
} from "@/lib/siteAds";

const PRIMARY_CTA: Record<SiteAdSlide["accent"], string> = {
  spotify: "Listen Now",
  navy: "Read Magazine",
  red: "Learn More",
  sky: "Visit MSA",
  enn: "Read News",
};

const SECONDARY_CTA: Record<SiteAdSlide["accent"], string> = {
  spotify: "Follow Now",
  navy: "Subscribe",
  red: "Get in Touch",
  sky: "Contact Us",
  enn: "Newsletter",
};

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
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

/** Full-bleed creative banner — image already includes branding/CTAs. */
function ImageBannerSlide({ slide }: { slide: SiteAdSlide }) {
  const linkProps = isExternal(slide.listenUrl)
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={slide.listenUrl}
      className="spotify-ad-banner spotify-ad-banner--image-full"
      aria-label={`${slide.kicker}: ${slide.headline}`}
      {...linkProps}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={slide.bannerImageUrl} alt="" className="spotify-ad-banner-img" />
    </a>
  );
}

function AdSlideCard({ slide }: { slide: SiteAdSlide }) {
  if (slide.bannerImageUrl) {
    return <ImageBannerSlide slide={slide} />;
  }

  if (slide.accent === "navy") return <EtMagazineSlide slide={slide} />;
  if (slide.accent === "sky") return <MsaSlide slide={slide} />;
  if (slide.accent === "red") return <EdhrSlide slide={slide} />;
  return <EtMagazineSlide slide={{ ...slide, accent: "navy" }} />;
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
  const autoplayMs = Math.max(config.autoplayMs || ADS_AUTOPLAY_MS, 3000);

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
      className="spotify-ad-bar partner-header-ads"
      aria-label="Partner advertisements"
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
