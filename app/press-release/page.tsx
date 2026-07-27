import { NewsListPage } from "@/components/NewsListPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Press Release",
  description: "Official announcements and press releases from Education News Network and Education Today.",
  path: "/press-release",
  keywords: ["education press release", "ENN announcements", "media release"],
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
