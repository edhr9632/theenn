import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.pressBits.title,
  description: PAGE_SEO.pressBits.description,
  path: "/events/press-bits",
  keywords: [...PAGE_SEO.pressBits.keywords],
});

export default function PressBitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
