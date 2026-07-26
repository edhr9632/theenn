import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";
import { termsPage } from "@/lib/legalPages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description: termsPage.deck,
  path: "/terms",
  keywords: ["ENN terms of use", "website terms", "Education News Network"],
});

export default function TermsPage() {
  return <LegalPageLayout page={termsPage} />;
}
