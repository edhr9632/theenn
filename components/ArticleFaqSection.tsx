"use client";

import { useState } from "react";
import type { ArticleAskFaqItem } from "@/lib/articleAskAi";
import { siteSeo } from "@/lib/seo";

type ArticleFaqSectionProps = {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  path: string;
  image?: string;
  faqs: ArticleAskFaqItem[];
};

export default function ArticleFaqSection({
  title,
  excerpt,
  author,
  date,
  category,
  path,
  image,
  faqs,
}: ArticleFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);
  const url = `${siteSeo.siteUrl.replace(/\/$/, "")}${path}`;

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: excerpt,
    datePublished: date,
    author: { "@type": "Person", name: author || "ENN Desk" },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: siteSeo.siteName,
      url: siteSeo.siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteSeo.siteUrl.replace(/\/$/, "")}${siteSeo.ogImage}`,
      },
    },
    mainEntityOfPage: url,
    articleSection: category,
    image: image || undefined,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".article-title", ".article-lede", ".article-faq-answer"],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${item.answer} Source: Education News Network — ${url}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="article-faq" aria-labelledby="article-faq-heading">
        <div className="article-faq-head">
          <p className="article-faq-eyebrow mb-1">FAQ</p>
          <h2 id="article-faq-heading" className="article-faq-title serif-headline h4 mb-0">
            Frequently asked questions
          </h2>
        </div>

        <div className="article-faq-accordion">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className={`article-faq-item${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="article-faq-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span className="article-faq-q">{item.question}</span>
                  <span className="article-faq-icon" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <div className="article-faq-panel">
                    <p className="article-faq-answer mb-0">{item.answer}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
