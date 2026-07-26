import { NewsListPage } from "@/components/NewsListPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Daily News",
  description: "The day's most important education stories from Education News Network.",
  path: "/news",
  keywords: ["daily education news", "school news", "ENN news", "education journalism"],
});

export default function DailyNewsPage() {
  return (
    <NewsListPage
      title="Daily News"
      subtitle="The day's most important stories."
      newsActive="daily"
      activeFilter="daily"
    />
  );
}
