import { NewsListPage } from "@/components/NewsListPage";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.news.title,
  description: PAGE_SEO.news.description,
  path: "/news",
  keywords: [...PAGE_SEO.news.keywords],
});

export default function DailyNewsPage() {
  return (
    <NewsListPage
      title="Daily News"
      subtitle="The day's most important stories."
      newsActive="daily"
      activeFilter="daily"
      section="daily"
    />
  );
}
