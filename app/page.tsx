import SiteMasthead from "@/components/SiteMasthead";
import HomePageContent from "@/components/HomePageContent";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  path: "/",
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  keywords: [...PAGE_SEO.home.keywords],
});

export default function HomePage() {
  return (
    <>
      <SiteMasthead activeNav="home" />
      <HomePageContent />
    </>
  );
}
