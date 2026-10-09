import { NewsListPage } from "@/components/NewsListPage";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.trending.title,
  description: PAGE_SEO.trending.description,
  path: "/trending-news",
  keywords: [...PAGE_SEO.trending.keywords],
});

export default function TrendingNewsPage() {
  return (
    <NewsListPage
      title="Trending News"
      subtitle="Stories gaining momentum across our network."
      newsActive="trending"
      activeFilter="trending"
      section="trending"
    />
  );
}
