import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";
import { privacyPage } from "@/lib/legalPages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: privacyPage.deck,
  path: "/privacy",
  keywords: ["ENN privacy policy", "data privacy", "Education News Network"],
});

export default function PrivacyPage() {
  return <LegalPageLayout page={privacyPage} />;
}
