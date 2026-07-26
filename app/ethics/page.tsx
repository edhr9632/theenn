import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";
import { ethicsPage } from "@/lib/legalPages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ethics Policy",
  description: ethicsPage.deck,
  path: "/ethics",
  keywords: ["ENN ethics", "journalism standards", "education news ethics"],
});

export default function EthicsPage() {
  return <LegalPageLayout page={ethicsPage} />;
}
