import SiteMasthead from "@/components/SiteMasthead";
import HomePageContent from "@/components/HomePageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/",
  description:
    "Education News Network — daily education news, weekly magazines, panel discussions, educator summits, and insights for schools across India.",
  keywords: [
    "education news india",
    "ENN",
    "Education Today",
    "school news",
    "educators summit",
    "K-12 leadership",
    "panel discussions",
  ],
});

export default function HomePage() {
  return (
    <>
      <SiteMasthead activeNav="home" />
      <HomePageContent />
    </>
  );
}
