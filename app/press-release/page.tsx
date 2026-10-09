import { NewsListPage } from "@/components/NewsListPage";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.press.title,
  description: PAGE_SEO.press.description,
  path: "/press-release",
  keywords: [...PAGE_SEO.press.keywords],
});

export default function PressReleasePage() {
  return (
    <NewsListPage
      title="Press Release"
      subtitle="Official announcements from Education News Network."
      newsActive="press"
      activeFilter="press"
      section="press"
    />
  );
}
