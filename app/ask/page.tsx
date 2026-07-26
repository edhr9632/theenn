import type { Metadata } from "next";
import Link from "next/link";
import AskEnnPageLauncher from "@/components/AskEnnPageLauncher";
import { getAskEnnFaqItems } from "@/lib/askEnnSuggestions";
import { buildPageMetadata, siteSeo } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "askENN — Education News Answers & Briefings",
  description:
    "Ask ENN about today's education news. Get AI briefings on ENN stories, trending education headlines, weekly magazines, and the latest podcasts from Education News Network.",
  path: "/ask",
  keywords: [
    "ask ENN",
    "education news AI",
    "ENN assistant",
    "education news search",
    "education headlines India",
    "weekly education magazine",
    "education podcasts",
    "trending education news",
  ],
});

export default function AskPage() {
  const faqItems = getAskEnnFaqItems(6);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${item.answer} Read more on Education News Network: ${siteSeo.siteUrl}${item.href}`,
      },
    })),
  };

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "askENN",
    applicationCategory: "NewsApplication",
    operatingSystem: "Web",
    url: `${siteSeo.siteUrl}/ask`,
    description:
      "Ask ENN answers questions about education news published by Education News Network, including daily headlines, weekly magazines, and podcasts.",
    publisher: {
      "@type": "NewsMediaOrganization",
      name: siteSeo.siteName,
      url: siteSeo.siteUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />

      <AskEnnPageLauncher />

      <section className="ask-enn-seo" aria-label="Popular education questions on ENN">
        <div className="ask-enn-seo-inner">
          <h2 className="ask-enn-seo-title">Popular education questions on ENN</h2>
          <p className="ask-enn-seo-lead">
            Ask ENN writes clear briefings from Education News Network reporting. Explore trending stories, weekly
            magazines, and podcasts after each answer.
          </p>
          <div className="ask-enn-seo-list">
            {faqItems.map((item) => (
              <article key={item.href} className="ask-enn-seo-card">
                <h3 className="ask-enn-seo-q">
                  <Link href={item.href}>{item.question}</Link>
                </h3>
                <p className="ask-enn-seo-a mb-2">{item.answer}</p>
                <Link href={item.href} className="ask-enn-seo-link">
                  Read full story →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
