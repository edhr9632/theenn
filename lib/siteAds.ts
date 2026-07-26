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
  accent: "spotify" | "navy" | "red" | "sky";
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
export const SITE_ADS_VERSION = "v6-official-logos-sized";

const DEFAULT_LISTEN =
  process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL?.trim() ||
  "https://open.spotify.com/search/Education%20News%20Network";

const DEFAULT_FOLLOW =
  process.env.NEXT_PUBLIC_SPOTIFY_FOLLOW_URL?.trim() || DEFAULT_LISTEN;

/** 2 minutes per slide */
export const ADS_AUTOPLAY_MS = 120000;

export function createAdSlideId() {
  return `ad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const DEFAULT_SITE_AD_SLIDES: SiteAdSlide[] = [
  {
    id: "ad-spotify-1",
    kicker: "Now On Spotify",
    headline: "Today's Top Stories : Daily News Updates",
    subtext: "Daily News Updates",
    listenUrl: DEFAULT_LISTEN,
    followUrl: DEFAULT_FOLLOW,
    bannerImageUrl: "",
    accent: "spotify",
    primaryLabel: "Listen Now",
    secondaryLabel: "Follow Now",
  },
  {
    id: "ad-et-magazine-2",
    kicker: "ET Magazine",
    headline: "Education Today magazine — insights for schools and leaders",
    subtext: "Feature stories, policy briefs, and city editions",
    listenUrl: "/weekly-news",
    followUrl: "/subscribe",
    bannerImageUrl: "",
    logoUrl: "/images/brands/et-logo.webp",
    brandColor: "#1A6BC8",
    accent: "navy",
    primaryLabel: "Read Magazine",
    secondaryLabel: "Subscribe",
  },
  {
    id: "ad-msa-3",
    kicker: "MSA School Admission",
    headline: "Open admissions guidance for parents and schools",
    subtext: "Timelines, checklists, and counselling support",
    listenUrl: "https://myschooladmission.com/",
    followUrl: "/contact",
    bannerImageUrl: "",
    logoUrl: "/images/brands/msa-logo.png",
    brandColor: "#00AEEF",
    accent: "sky",
    primaryLabel: "Explore Admissions",
    secondaryLabel: "Contact Us",
  },
  {
    id: "ad-edhr-4",
    kicker: "EDHR",
    headline: "Education HR resources for schools and institutions",
    subtext: "Hiring, talent development, and leadership pipelines",
    listenUrl: "https://www.edhr.in/",
    followUrl: "/contact",
    bannerImageUrl: "",
    logoUrl: "/images/brands/edhr-logo.png",
    brandColor: "#080808",
    accent: "red",
    primaryLabel: "Learn More",
    secondaryLabel: "Get in Touch",
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
      typeof raw.autoplayMs === "number" && raw.autoplayMs >= ADS_AUTOPLAY_MS
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
        bannerImageUrl: slide.bannerImageUrl || "",
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

    // Always keep ads visible unless admin explicitly turns them off after this version.
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
