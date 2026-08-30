/**
 * Festival Greeting Popup — defaults / catalogue fallback.
 * Live popup content is managed in Admin → Festival Popup (database).
 * This file remains the offline fallback when the DB is unavailable.
 */

export type FestivalTheme = "default" | "onam" | "diwali" | "holi" | "independence";

export type FestivalDefinition = {
  image: string;
  title: string;
  /** Short line under the title in the greeting card. */
  subtitle?: string;
  /** Warm wish line shown in the popup. */
  message?: string;
  /** Visual theme for confetti + greeting styling. */
  theme?: FestivalTheme;
  /** Optional link when the poster is clicked. */
  href?: string;
};

const PLACEHOLDER = "/images/festivals/festival-placeholder.svg";

/** Catalogue of festival posters — add new festivals here. */
export const FESTIVALS = {
  onam: {
    image: "/images/festivals/onam.png",
    title: "Happy Onam",
    subtitle: "Festival of Prosperity",
    message: "Celebrating tradition, togetherness & prosperity with educators and families across India.",
    theme: "onam",
  },
  diwali: {
    image: "/images/festivals/diwali.svg",
    title: "Happy Diwali",
    subtitle: "Festival of Lights",
    message: "May your classrooms and homes glow with wisdom, joy, and new beginnings.",
    theme: "diwali",
  },
  independenceDay: {
    image: PLACEHOLDER,
    title: "Happy Independence Day",
    subtitle: "Celebrating Freedom",
    message: "Honouring the spirit of learning and nation-building.",
    theme: "independence",
  },
  republicDay: {
    image: PLACEHOLDER,
    title: "Happy Republic Day",
    subtitle: "Pride of India",
    message: "Celebrating our Constitution, our schools, and our shared future.",
    theme: "independence",
  },
  christmas: {
    image: PLACEHOLDER,
    title: "Merry Christmas",
    subtitle: "Season of Joy",
    message: "Wishing peace, kindness, and bright learning days ahead.",
  },
  dussehra: {
    image: PLACEHOLDER,
    title: "Happy Dussehra",
    subtitle: "Victory of Good",
    message: "May courage and goodness guide every learner.",
  },
  pongal: {
    image: PLACEHOLDER,
    title: "Happy Pongal",
    subtitle: "Harvest Festival",
    message: "Wishing abundance, gratitude, and fresh beginnings.",
  },
  holi: {
    image: PLACEHOLDER,
    title: "Happy Holi",
    subtitle: "Festival of Colours",
    message: "May your world be filled with colour, laughter, and learning.",
    theme: "holi",
  },
  eid: {
    image: PLACEHOLDER,
    title: "Eid Mubarak",
    subtitle: "Peace & Blessings",
    message: "Wishing warmth, peace, and togetherness to every family.",
  },
  ganeshChaturthi: {
    image: PLACEHOLDER,
    title: "Happy Ganesh Chaturthi",
    subtitle: "Auspicious Beginnings",
    message: "May wisdom remove every obstacle on the path of learning.",
  },
  teachersDay: {
    image: PLACEHOLDER,
    title: "Happy Teachers' Day",
    subtitle: "Honouring Educators",
    message: "Thank you for shaping minds and lighting futures.",
  },
  childrensDay: {
    image: PLACEHOLDER,
    title: "Happy Children's Day",
    subtitle: "Joy of Learning",
    message: "Celebrating curiosity, play, and every young learner.",
  },
  newYear: {
    image: PLACEHOLDER,
    title: "Happy New Year",
    subtitle: "A Fresh Chapter",
    message: "Here's to brighter classrooms and bolder dreams.",
  },
} as const satisfies Record<string, FestivalDefinition>;

export type FestivalKey = keyof typeof FESTIVALS;

export type FestivalPopupConfig = {
  enabled: boolean;
  activeFestival: FestivalKey | null;
  image?: string;
  title?: string;
  subtitle?: string;
  message?: string;
  theme?: FestivalTheme;
  href?: string;
  /** Bold scrolling wish text in the top LIVE bar (only when enabled). */
  topBarTickerText?: string;
  showOncePerSession: boolean;
  showOncePerDay: boolean;
  closeOnOutsideClick: boolean;
  closeOnEscape: boolean;
  confettiEnabled: boolean;
  confettiCount: number;
  animationDuration: number;
  storageKey: string;
};

/**
 * Edit this object to control the festival popup.
 * Do not change the React component for routine festival swaps.
 */
export const FESTIVAL_POPUP_CONFIG: FestivalPopupConfig = {
  enabled: false,
  activeFestival: "onam",

  /** Bold scrolling wish in the top LIVE bar — only shown while festival is enabled. */
  topBarTickerText: "Happy Onam & Eid Mubarak — celebrating togetherness, prosperity & joy",

  /** Show on every full refresh so you can verify it immediately. */
  showOncePerSession: false,
  showOncePerDay: false,

  closeOnOutsideClick: true,
  closeOnEscape: true,

  /** Confetti disabled — popup poster only. */
  confettiEnabled: false,
  confettiCount: 0,
  animationDuration: 900,

  storageKey: "enn-festival-popup-onam-2026-v2",
};

export type ResolvedFestival = FestivalDefinition & {
  theme: FestivalTheme;
};

/** Resolved poster used by the popup component. */
export function resolveActiveFestival(
  config: FestivalPopupConfig = FESTIVAL_POPUP_CONFIG,
): ResolvedFestival | null {
  if (!config.enabled) return null;

  const fromCatalogue =
    config.activeFestival && config.activeFestival in FESTIVALS
      ? (FESTIVALS[config.activeFestival] as FestivalDefinition)
      : null;

  const image = (config.image?.trim() || fromCatalogue?.image || "").trim();
  const title = (config.title?.trim() || fromCatalogue?.title || "Festival Greeting").trim();
  const subtitle = (config.subtitle?.trim() || fromCatalogue?.subtitle || "").trim() || undefined;
  const message = (config.message?.trim() || fromCatalogue?.message || "").trim() || undefined;
  const href = (config.href?.trim() || fromCatalogue?.href?.trim() || "") || undefined;
  const theme = config.theme || fromCatalogue?.theme || "default";

  if (!image) return null;

  return { image, title, subtitle, message, href, theme };
}

/** Top-bar festival ticker text (empty when festival is off). */
export function getFestivalTopBarTicker(
  config: FestivalPopupConfig = FESTIVAL_POPUP_CONFIG,
): string {
  if (!config.enabled) return "";
  const text = config.topBarTickerText?.trim();
  if (text) return text;
  const festival = resolveActiveFestival(config);
  return festival?.title ? `${festival.title} — warm wishes from Education News Network` : "";
}

export const FESTIVAL_CONFETTI_COLORS: Record<FestivalTheme, string[]> = {
  default: ["#d62839", "#f59e0b", "#fbbf24", "#1a4099", "#2abcf3", "#059669", "#ffffff"],
  onam: ["#F4C430", "#F58220", "#E91E63", "#FFFFFF", "#2E7D32", "#FFD54F", "#FF7043", "#0B2A5B"],
  diwali: ["#fbbf24", "#f59e0b", "#7c2d12", "#fff7ed", "#d62839", "#1a0a2e"],
  holi: ["#ec4899", "#22d3ee", "#a3e635", "#f97316", "#c084fc", "#ffffff"],
  independence: ["#FF9933", "#FFFFFF", "#138808", "#000080", "#fbbf24"],
};
