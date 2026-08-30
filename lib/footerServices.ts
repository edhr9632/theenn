export type FooterLink = {
  label: string;
  href: string;
};

export type FooterServiceGroup = {
  title: string;
  links: FooterLink[];
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

export const footerExploreLinks: FooterLink[] = [
  { label: "Daily News", href: "/news" },
  { label: "Weekly News", href: "/weekly-news" },
  { label: "Trending News", href: "/trending-news" },
  { label: "Press Release", href: "/press-release" },
  { label: "Insights", href: "/insights" },
  { label: "Panel Discussions", href: "/panel-discussions" },
  { label: "Ask ENN", href: "/ask" },
];

export const footerCompanyLinks: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Featured Events", href: "/events" },
  { label: "Speakers", href: "/events/speakers" },
  { label: "Sponsors", href: "/events/sponsors" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Subscribe", href: "/subscribe" },
];

export const footerSocialLinks: FooterLink[] = [
  { label: "YouTube", href: "https://www.youtube.com/@educationtoday7909" },
  { label: "Facebook", href: "https://www.facebook.com/edutodayk12/" },
  { label: "Instagram", href: "https://www.instagram.com/educationtodayk12" },
];
