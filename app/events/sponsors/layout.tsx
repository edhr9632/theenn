import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sponsors",
  description:
    "Meet sponsors of Education News Network summits and conferences — filter by year and event category.",
  path: "/events/sponsors",
  keywords: ["education sponsors", "summit partners", "ENN sponsors"],
});

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
