import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";
import { termsPage } from "@/lib/legalPages";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.terms.title,
  description: termsPage.deck || PAGE_SEO.terms.description,
  path: "/terms",
  keywords: [...PAGE_SEO.terms.keywords],
});

export default function TermsPage() {
  return <LegalPageLayout page={termsPage} />;
}
