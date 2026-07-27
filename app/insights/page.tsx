import type { Metadata } from "next";
import Link from "next/link";
import SiteMasthead from "@/components/SiteMasthead";
import NewsArchiveCard from "@/components/NewsArchiveCard";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import { isDbConfigured } from "@/lib/db";
import { getNewsBySection } from "@/lib/newsDb";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights",
  description: "In-depth education insights, analysis, and expert perspectives from Education News Network.",
  path: "/insights",
  keywords: ["education insights", "school analysis", "education policy", "ENN insights"],
});

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  let insights: Awaited<ReturnType<typeof getNewsBySection>> = [];
  if (isDbConfigured()) {
    try {
      const [daily, trending] = await Promise.all([
        getNewsBySection("daily", 6),
        getNewsBySection("trending", 6),
      ]);
      const seen = new Set<string>();
      insights = [...trending, ...daily].filter((item) => {
        if (seen.has(item.slug)) return false;
        seen.add(item.slug);
        return true;
      }).slice(0, 9);
    } catch (error) {
      console.error("[InsightsPage]", error);
    }
  }

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
          {!insights.length ? (
            <ComingSoonBlock
              title="Insights coming soon"
              message="Published education analysis from the admin panel will appear here."
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      </main>
    </>
  );
}
