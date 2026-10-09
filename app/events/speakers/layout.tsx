import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.speakers.title,
  description: PAGE_SEO.speakers.description,
  path: "/events/speakers",
  keywords: [...PAGE_SEO.speakers.keywords],
});

export default function SpeakersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
