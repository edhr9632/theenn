import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Press Bits",
  description:
    "Event press bits and reel videos from Education News Network summits, awards, and leadership conferences.",
  path: "/events/press-bits",
  keywords: ["press bits", "education event reels", "ENN events", "educators summit videos"],
});

export default function PressBitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
