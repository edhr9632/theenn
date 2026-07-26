import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/lib/data";
import SectionBroadcastHeader from "./SectionBroadcastHeader";
import ComingSoonBlock from "./ComingSoonBlock";

function DailyGridCard({ item }: { item: NewsArticle }) {
  return (
    <div className="col-6">
      <article className="daily-news-grid-card position-relative h-100">
        <div className="daily-news-grid-thumb">
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            className="object-fit-cover"
            sizes="(max-width:768px) 45vw, 18vw"
          />
        </div>
        <h3 className="daily-news-grid-title mb-0">
          <Link href={`/news/${item.slug}`} className="daily-news-grid-link stretched-link">
            {item.title}
          </Link>
        </h3>
      </article>
    </div>
  );
}

function TrendingItem({ item }: { item: NewsArticle }) {
  return (
    <li className="trending-news-item">
      <article className="trending-news-article position-relative">
        <div className="trending-news-thumb flex-shrink-0">
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            className="object-fit-cover"
            sizes="96px"
          />
        </div>
        <h3 className="trending-news-title mb-0">
          <Link href={`/news/${item.slug}`} className="trending-news-link stretched-link">
            {item.title}
          </Link>
        </h3>
      </article>
    </li>
  );
}

type DailyTrendingNewsProps = {
  daily: NewsArticle[];
  trending: NewsArticle[];
};

export default function DailyTrendingNews({ daily, trending }: DailyTrendingNewsProps) {
  const dailyFeatured = daily[0];
  const dailyBullets = daily.slice(1, 6);
  const dailyGridLeft = daily.slice(6, 8);
  const dailyGridRight = daily.slice(8, 10);

  return (
    <section className="daily-trending-section pt-4 pt-lg-5" aria-label="Daily and trending news">
      <div className="container">
        <div className="row g-4 g-lg-0 daily-trending-row">
          <div className="col-lg-9 daily-news-col">
            <SectionBroadcastHeader title="Daily News" href="/news" className="mb-3" />

            {!dailyFeatured ? (
              <ComingSoonBlock
                title="Daily News coming soon"
                message="Publish daily stories in Admin → News → Daily News."
              />
            ) : (
              <div className="daily-news-top row g-3 g-lg-4 align-items-stretch">
                <div className="col-md-6 d-flex flex-column min-h-0">
                  <article className="daily-news-feature position-relative flex-grow-1">
                    <div className="daily-news-feature-media h-100">
                      <Image
                        src={dailyFeatured.image}
                        alt={dailyFeatured.imageAlt}
                        fill
                        className="object-fit-cover"
                        sizes="(max-width:768px) 100vw, 32vw"
                        priority
                      />
                      <div className="daily-news-feature-overlay">
                        <h3 className="daily-news-feature-title mb-0">
                          <Link href={`/news/${dailyFeatured.slug}`} className="daily-news-feature-link stretched-link">
                            {dailyFeatured.title}
                          </Link>
                        </h3>
                      </div>
                    </div>
                  </article>

                  <div className="row g-3 g-lg-4 mt-1 mt-lg-3 daily-news-subgrid">
                    {dailyGridLeft.map((item) => (
                      <DailyGridCard key={item.slug} item={item} />
                    ))}
                  </div>
                </div>

                <div className="col-md-6 d-flex flex-column min-h-0">
                  <ul className="daily-news-list list-unstyled mb-0 flex-grow-1">
                    {dailyBullets.map((item) => (
                      <li key={item.slug} className="daily-news-list-item">
                        <Link href={`/news/${item.slug}`} className="daily-news-list-link">
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="row g-3 g-lg-4 mt-1 mt-lg-3 daily-news-subgrid">
                    {dailyGridRight.map((item) => (
                      <DailyGridCard key={item.slug} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-3 trending-news-col">
            <SectionBroadcastHeader title="Trending News" href="/trending-news" className="mb-3" />
            {!trending.length ? (
              <ComingSoonBlock
                compact
                title="Trending coming soon"
                message="Add trending stories in Admin → News → Trending News."
              />
            ) : (
              <ul className="trending-news-list list-unstyled mb-0">
                {trending.map((item) => (
                  <TrendingItem key={`trending-${item.slug}`} item={item} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
