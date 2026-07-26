export type SiteAdSlide = {
  id: string;
  kicker: string;
  headline: string;
  subtext: string;
  listenUrl: string;
  followUrl: string;
  bannerImageUrl: string;
  logoUrl?: string;
  brandColor?: string;
  accent: "spotify" | "navy" | "red" | "sky" | "enn";
  primaryLabel?: string;
  secondaryLabel?: string;
};

export type SiteAdsConfig = {
  enabled: boolean;
  autoplayMs: number;
  slides: SiteAdSlide[];
};

export const SITE_ADS_STORAGE_KEY = "enn_admin_site_ads";
export const SITE_ADS_VERSION_KEY = "enn_admin_site_ads_version";
export const SITE_ADS_VERSION = "v10-et-msa-edhr-banners";

/** Seconds between slides in the header carousel */
export const ADS_AUTOPLAY_MS = 5000;

export function createAdSlideId() {
  return `ad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Header partner ads — ET, MSA, EDHR banner images. */
export const DEFAULT_SITE_AD_SLIDES: SiteAdSlide[] = [
  {
    id: "ad-et-magazine",
    kicker: "ET Magazine",
    headline: "India's leading education magazine — subscribe now",
    subtext: "Explore premium Education Today magazine",
    listenUrl: "/subscribe",
    followUrl: "/weekly-news",
    bannerImageUrl: "/images/ads/et-subscribe-banner.jpg",
    logoUrl: "/images/brands/et-logo.webp",
    brandColor: "#1A6BC8",
    accent: "navy",
    primaryLabel: "Subscribe Now",
    secondaryLabel: "Read Magazine",
  },
  {
    id: "ad-msa",
    kicker: "MSA School Admission",
    headline: "Looking for school admission? Visit MSA",
    subtext: "Discover schools, compare options, and apply with ease",
    listenUrl: "https://myschooladmission.com/",
    followUrl: "/contact",
    bannerImageUrl: "/images/ads/msa-banner.png",
    logoUrl: "/images/brands/msa-logo.png",
    brandColor: "#00AEEF",
    accent: "sky",
    primaryLabel: "Visit MSA",
    secondaryLabel: "Contact Us",
  },
  {
    id: "ad-edhr",
    kicker: "EDHR",
    headline: "Exclusive platform for principals & directors",
    subtext: "Education Directors & Heads Recruitment",
    listenUrl: "https://www.edhr.in/",
    followUrl: "/contact",
    bannerImageUrl: "/images/ads/edhr-banner.png",
    logoUrl: "/images/brands/edhr-logo.png",
    brandColor: "#080808",
    accent: "red",
    primaryLabel: "Register Now",
    secondaryLabel: "Get In Touch",
  },
];

export const DEFAULT_SITE_ADS: SiteAdsConfig = {
  enabled: true,
  autoplayMs: ADS_AUTOPLAY_MS,
  slides: DEFAULT_SITE_AD_SLIDES,
};

function normalizeConfig(raw: Partial<SiteAdsConfig>): SiteAdsConfig {
  const slides =
    Array.isArray(raw.slides) && raw.slides.length > 0 ? raw.slides : DEFAULT_SITE_AD_SLIDES;

  return {
    enabled: raw.enabled !== false,
    autoplayMs:
      typeof raw.autoplayMs === "number" && raw.autoplayMs >= 3000
        ? raw.autoplayMs
        : ADS_AUTOPLAY_MS,
    slides: slides.slice(0, 8).map((slide, index) => {
      const fallback = DEFAULT_SITE_AD_SLIDES[Math.min(index, DEFAULT_SITE_AD_SLIDES.length - 1)];
      return {
        id: slide.id || `ad-${index + 1}`,
        kicker: slide.kicker || fallback.kicker,
        headline: slide.headline || fallback.headline,
        subtext: slide.subtext || fallback.subtext,
        listenUrl: slide.listenUrl || fallback.listenUrl,
        followUrl: slide.followUrl || fallback.followUrl,
        bannerImageUrl: slide.bannerImageUrl || fallback.bannerImageUrl || "",
        logoUrl: slide.logoUrl || fallback.logoUrl,
        brandColor: slide.brandColor || fallback.brandColor,
        accent: slide.accent || fallback.accent,
        primaryLabel: slide.primaryLabel || fallback.primaryLabel,
        secondaryLabel: slide.secondaryLabel || fallback.secondaryLabel,
      };
    }),
  };
}

export function resetSiteAdsToDefaults() {
  if (typeof window === "undefined") return DEFAULT_SITE_ADS;
  window.localStorage.setItem(SITE_ADS_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_ADS));
  window.localStorage.setItem(SITE_ADS_VERSION_KEY, SITE_ADS_VERSION);
  return { ...DEFAULT_SITE_ADS, slides: [...DEFAULT_SITE_AD_SLIDES] };
}

export function readSiteAds(): SiteAdsConfig {
  if (typeof window === "undefined") return DEFAULT_SITE_ADS;

  try {
    const version = window.localStorage.getItem(SITE_ADS_VERSION_KEY);
    if (version !== SITE_ADS_VERSION) {
      return resetSiteAdsToDefaults();
    }

    const raw = window.localStorage.getItem(SITE_ADS_STORAGE_KEY);
    if (!raw) return resetSiteAdsToDefaults();

    const parsed = JSON.parse(raw) as Partial<SiteAdsConfig>;
    const normalized = normalizeConfig(parsed);

    if (!normalized.slides.length) return resetSiteAdsToDefaults();

    return normalized;
  } catch {
    return resetSiteAdsToDefaults();
  }
}

export function writeSiteAds(config: SiteAdsConfig) {
  if (typeof window === "undefined") return;
  const next = normalizeConfig(config);
  window.localStorage.setItem(SITE_ADS_STORAGE_KEY, JSON.stringify(next));
  window.localStorage.setItem(SITE_ADS_VERSION_KEY, SITE_ADS_VERSION);
}
