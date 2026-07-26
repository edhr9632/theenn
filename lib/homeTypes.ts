/** Client-safe types for home page content (no database imports). */

export type PromoBanner = {
  id: string;
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  variant: string;
};

export type PanelDiscussionItem = {
  episode: string;
  duration: string;
  topic: string;
  title: string;
  speakers: string;
  image: string;
  youtube: string;
};
