import type { FestivalTheme } from "@/lib/festivalPopupConfig";

export type FestivalPost = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  message: string;
  imageUrl: string;
  theme: FestivalTheme;
  href: string;
  topBarTickerText: string;
  listenIntroText: string;
  published: boolean;
  sortOrder: number;
  updatedAt?: string;
};

export type FestivalConfigSettings = {
  enabled: boolean;
  activePostId: string | null;
  showOncePerSession: boolean;
  showOncePerDay: boolean;
  closeOnOutsideClick: boolean;
  closeOnEscape: boolean;
  confettiEnabled: boolean;
  confettiCount: number;
  animationDuration: number;
  storageKey: string;
};

export type FestivalAdminState = FestivalConfigSettings & {
  posts: FestivalPost[];
};

export type FestivalConfigInput = Partial<FestivalConfigSettings>;

export type FestivalPostInput = {
  slug?: string;
  title: string;
  subtitle?: string;
  message?: string;
  imageUrl: string;
  theme?: FestivalTheme;
  href?: string;
  topBarTickerText?: string;
  listenIntroText?: string;
  published?: boolean;
  sortOrder?: number;
};

export function createFestivalPostId() {
  return `fest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
