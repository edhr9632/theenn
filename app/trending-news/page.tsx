import { NewsListPage } from "@/components/NewsListPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Trending News",
  description: "Stories gaining momentum across Education News Network — education headlines readers are following now.",
  path: "/trending-news",
  keywords: ["trending education news", "viral school stories", "ENN trending"],
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
