import type { Metadata } from "next";
import Link from "next/link";
import SiteMasthead from "@/components/SiteMasthead";
import NewsArchiveCard from "@/components/NewsArchiveCard";
import { newsArticles } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights",
  description: "In-depth education insights, analysis, and expert perspectives from Education News Network.",
  path: "/insights",
  keywords: ["education insights", "school analysis", "education policy", "ENN insights"],
});

export default function InsightsPage() {
  const insights = newsArticles.slice(0, 9);

  return (
    <>
      <SiteMasthead activeNav="insights" />
      <main className="news-page">
        <section className="news-hero" aria-labelledby="insights-hero-heading">
          <div className="container">
            <p className="news-hero-eyebrow text-uppercase mb-2 mb-lg-3">Analysis</p>
            <h1 id="insights-hero-heading" className="news-hero-title serif-headline mb-3 mb-lg-4">
              Insights.
            </h1>
            <p className="news-hero-deck mb-0">
              In-depth education insights, analysis, and expert perspectives from Education News Network.
            </p>
          </div>
        </section>
        <div className="container py-4 py-lg-5">
          <div className="row g-4">
            {insights.map((article) => (
              <div key={article.slug} className="col-md-6 col-lg-4">
                <NewsArchiveCard article={article} />
              </div>
            ))}
          </div>
          <p className="text-center mt-4 mb-0">
            <Link href="/news" className="btn btn-outline-primary">
              Browse all news
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
