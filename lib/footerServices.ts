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
      { label: "Education Policy", href: "/news" },
      { label: "Higher Education", href: "/news" },
      { label: "K-12 Schools", href: "/news" },
      { label: "EdTech & Innovation", href: "/news" },
      { label: "International Education", href: "/news" },
      { label: "Teacher Leadership", href: "/news" },
    ],
  },
  {
    title: "Programs & Media",
    links: [
      { label: "Panel Discussions", href: "/panel-discussions" },
      { label: "Knowledge Plus", href: "/podcasts/knowledge-plus" },
      { label: "ENN Daily Brief", href: "/podcasts/enn-daily-brief" },
      { label: "Classroom Voices", href: "/podcasts/classroom-voices" },
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
