import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Speakers",
  description:
    "Browse speakers from Education News Network summits and conferences — filter by year and event category.",
  path: "/events/speakers",
  keywords: ["education speakers", "summit speakers", "educators summit", "ENN speakers"],
});

export default function SpeakersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
