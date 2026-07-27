export type FooterServiceLink = {
  label: string;
  href: string;
};

export type FooterServiceGroup = {
  title: string;
  links: FooterServiceLink[];
};

export const footerServiceGroups: FooterServiceGroup[] = [
  {
    title: "News & Coverage",
    links: [
      { label: "Daily News", href: "/news" },
      { label: "Weekly News", href: "/weekly-news" },
      { label: "Trending News", href: "/trending-news" },
      { label: "Press Release", href: "/press-release" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    title: "Programs & Media",
    links: [
      { label: "Panel Discussions", href: "/panel-discussions" },
      { label: "Podcasts", href: "/podcasts" },
      { label: "Featured Events", href: "/events" },
      { label: "Speakers", href: "/events/speakers" },
      { label: "Sponsors", href: "/events/sponsors" },
      { label: "Newsletter Signup", href: "/newsletter" },
      { label: "Subscribe", href: "/subscribe" },
      { label: "About ENN", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];
