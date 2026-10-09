import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.sponsors.title,
  description: PAGE_SEO.sponsors.description,
  path: "/events/sponsors",
  keywords: [...PAGE_SEO.sponsors.keywords],
});

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
