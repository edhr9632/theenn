import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";
import { ethicsPage } from "@/lib/legalPages";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.ethics.title,
  description: ethicsPage.deck || PAGE_SEO.ethics.description,
  path: "/ethics",
  keywords: [...PAGE_SEO.ethics.keywords],
});

export default function EthicsPage() {
  return <LegalPageLayout page={ethicsPage} />;
}
