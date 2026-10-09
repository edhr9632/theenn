import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.weekly.title,
  description: PAGE_SEO.weekly.description,
  path: "/weekly-news",
  keywords: [...PAGE_SEO.weekly.keywords],
});

export default function WeeklyNewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
