"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NEWS_TABS = [
  { href: "/admin/news/top-education", label: "Top Education News", key: "top_education" },
  { href: "/admin/news/daily", label: "Daily News", key: "daily" },
  { href: "/admin/news/weekly", label: "Weekly News", key: "weekly" },
  { href: "/admin/news/trending", label: "Trending News", key: "trending" },
  { href: "/admin/news/press", label: "Press Release", key: "press" },
] as const;

export default function AdminNewsTabs() {
  const pathname = usePathname();

  return (
    <nav className="admin-news-tabs" aria-label="News sections">
      {NEWS_TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`admin-news-tab${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
