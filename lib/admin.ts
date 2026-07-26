export type AdminNavChild = {
  href: string;
  label: string;
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  children?: AdminNavChild[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/news", label: "News", icon: "news" },
  { href: "/admin/categories", label: "Categories", icon: "folder" },
  { href: "/admin/ads", label: "Ads", icon: "ads" },
  { href: "/admin/videos", label: "Videos", icon: "video" },
  { href: "/admin/shorts", label: "Shorts", icon: "video" },
  { href: "/admin/panels", label: "Panel Discussions", icon: "panels" },
  { href: "/admin/podcasts", label: "Podcasts", icon: "mic" },
  {
    href: "/admin/events",
    label: "Events",
    icon: "calendar",
    children: [
      { href: "/admin/speakers", label: "Speakers" },
      { href: "/admin/sponsors", label: "Sponsors" },
    ],
  },
  { href: "/admin/contacts", label: "Contact Messages", icon: "mail" },
  { href: "/admin/comments", label: "Comments", icon: "mail" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

/** Demo login — replace with real API/auth later */
export const ADMIN_DEMO_CREDENTIALS = {
  email: "admin@ennnews.com",
  password: "admin123",
};

export const ADMIN_STORAGE_KEY = "enn_admin_session";

export function isAdminNavActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function isAdminNavGroupActive(pathname: string, item: AdminNavItem) {
  if (isAdminNavActive(pathname, item.href)) return true;
  return item.children?.some((child) => isAdminNavActive(pathname, child.href)) ?? false;
}
