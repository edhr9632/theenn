import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Weekly News",
  description:
    "Education Today weekly Bengaluru magazine editions — open and download each PDF from Education News Network.",
  path: "/weekly-news",
  keywords: ["weekly education magazine", "Education Today Bengaluru", "ENN weekly news"],
});

export default function WeeklyNewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
