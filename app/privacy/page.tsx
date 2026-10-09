import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";
import { privacyPage } from "@/lib/legalPages";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.privacy.title,
  description: privacyPage.deck || PAGE_SEO.privacy.description,
  path: "/privacy",
  keywords: [...PAGE_SEO.privacy.keywords],
});

export default function PrivacyPage() {
  return <LegalPageLayout page={privacyPage} />;
}
