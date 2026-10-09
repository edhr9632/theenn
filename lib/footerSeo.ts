import type { FooterLink } from "@/lib/footerServices";

export type FooterSeoGroup = {
  title: string;
  links: FooterLink[];
};

/** High-volume education topic hubs + brand discovery links for crawl paths */
export const footerSeoGroups: FooterSeoGroup[] = [
  {
    title: "Education news topics",
    links: [
      { label: "Education news India", href: "/news" },
      { label: "CBSE & board exam news", href: "/trending-news" },
      { label: "School admission updates", href: "/news" },
      { label: "NEET & JEE education news", href: "/trending-news" },
      { label: "Education policy & NEP", href: "/insights" },
      { label: "Weekly education magazine", href: "/weekly-news" },
    ],
  },
  {
    title: "Discover ENN",
    links: [
      { label: "Ask ENN — AI education briefings", href: "/ask" },
      { label: "Daily education news", href: "/news" },
      { label: "Press releases", href: "/press-release" },
      { label: "Educators summit & events", href: "/events" },
      { label: "Panel discussions", href: "/panel-discussions" },
      { label: "Education podcasts", href: "/podcasts" },
    ],
  },
  {
    title: "Site & policies",
    links: [
      { label: "About Education News Network", href: "/about" },
      { label: "Contact ENN Bengaluru", href: "/contact" },
      { label: "Newsletter signup", href: "/newsletter" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "XML sitemap", href: "/sitemap.xml" },
    ],
  },
];

export function truncateFooterLabel(text: string, max = 72) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}
