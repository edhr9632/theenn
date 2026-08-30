import type { FooterLink } from "@/lib/footerServices";

export type FooterSeoGroup = {
  title: string;
  links: FooterLink[];
};

/** Static SEO-friendly discovery links shown at the bottom of the footer. */
export const footerSeoGroups: FooterSeoGroup[] = [
  {
    title: "Education topics",
    links: [
      { label: "Education news India", href: "/news" },
      { label: "School leadership & policy", href: "/insights" },
      { label: "Trending education headlines", href: "/trending-news" },
      { label: "Weekly education magazine", href: "/weekly-news" },
      { label: "Press releases", href: "/press-release" },
      { label: "Panel discussions", href: "/panel-discussions" },
    ],
  },
  {
    title: "Discover ENN",
    links: [
      { label: "Ask ENN — AI education briefings", href: "/ask" },
      { label: "Daily news archive", href: "/news" },
      { label: "Weekly news editions", href: "/weekly-news" },
      { label: "Education events", href: "/events" },
      { label: "Newsletter signup", href: "/newsletter" },
      { label: "Subscribe to ENN", href: "/subscribe" },
    ],
  },
  {
    title: "Site & policies",
    links: [
      { label: "About Education News Network", href: "/about" },
      { label: "Contact ENN", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Ethics policy", href: "/ethics" },
      { label: "XML sitemap", href: "/sitemap.xml" },
    ],
  },
];

export function truncateFooterLabel(text: string, max = 72) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}
