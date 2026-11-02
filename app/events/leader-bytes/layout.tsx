import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.leaderBytes.title,
  description: PAGE_SEO.leaderBytes.description,
  path: "/events/leader-bytes",
  keywords: [...PAGE_SEO.leaderBytes.keywords],
});

export default function LeaderBytesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
