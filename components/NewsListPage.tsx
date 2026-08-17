import Link from "next/link";
import SiteMasthead from "@/components/SiteMasthead";
import NewsArchiveCard from "@/components/NewsArchiveCard";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import { isDbConfigured } from "@/lib/db";
import { getNewsBySection } from "@/lib/newsDb";
import type { NewsArticle } from "@/lib/data";
import type { NewsSection } from "@/lib/newsTypes";

type NewsListPageProps = {
  title: string;
  subtitle: string;
  newsActive: "daily" | "weekly" | "trending" | "press";
  activeFilter: string;
  section: Extract<NewsSection, "daily" | "trending" | "press">;
};

const filters = [
  { href: "/news", label: "Daily", key: "daily" },
  { href: "/weekly-news", label: "Weekly", key: "weekly" },
  { href: "/trending-news", label: "Trending", key: "trending" },
  { href: "/press-release", label: "Press release", key: "press" },
] as const;

const eyebrowByFilter: Record<NewsListPageProps["newsActive"], string> = {
  daily: "Daily News",
  weekly: "Weekly News",
  trending: "Trending News",
  press: "Press Release",
};

async function loadArticles(section: NewsListPageProps["section"]): Promise<NewsArticle[]> {
  if (!isDbConfigured()) return [];
  try {
    const primary = await getNewsBySection(section);
    if (primary.length || section !== "trending") return primary;

    const [daily, topEducation] = await Promise.all([
      getNewsBySection("daily", 12),
      getNewsBySection("top_education", 8),
    ]);
    const seen = new Set<string>();
    return [...daily, ...topEducation].filter((article) => {
      if (seen.has(article.slug)) return false;
      seen.add(article.slug);
      return true;
    });
  } catch (error) {
    console.error("[NewsListPage]", error);
    return [];
  }
}

export async function NewsListPage({ title, subtitle, newsActive, activeFilter, section }: NewsListPageProps) {
  const articles = await loadArticles(section);

  return (
    <>
      <SiteMasthead activeNav="news" newsActive={newsActive} />
      <main className="news-page">
        <section className="news-hero" aria-labelledby="news-hero-heading">
          <div className="container">
            <p className="news-hero-eyebrow text-uppercase mb-2 mb-lg-3">{eyebrowByFilter[newsActive]}</p>
            <h1 id="news-hero-heading" className="news-hero-title serif-headline mb-3 mb-lg-4">
              {title}
            </h1>
            <p className="news-hero-deck mb-0">{subtitle}</p>
          </div>
        </section>

        <div className="news-filter-bar">
          <div className="container">
            <nav className="d-flex flex-wrap align-items-center gap-1 gap-md-2 py-1" aria-label="News categories">
              {filters.map((f) => (
                <Link
                  key={f.key}
                  className={`news-filter-pill${activeFilter === f.key ? " is-active" : ""}`}
                  href={f.href}
                  aria-current={activeFilter === f.key ? "page" : undefined}
                >
                  {f.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="container py-4 py-lg-5">
          {!articles.length ? (
            <ComingSoonBlock
              title={`${title} coming soon`}
              message="Published stories from the admin panel will appear here automatically."
            />
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {articles.map((article) => (
                <div key={article.slug} className="col">
                  <NewsArchiveCard article={article} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
