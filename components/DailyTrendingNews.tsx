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

type DailyTrendingNewsProps = {
  daily: NewsArticle[];
  trending?: NewsArticle[];
};

export default function DailyTrendingNews({ daily }: DailyTrendingNewsProps) {
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
              <div className="daily-news-top">
                <div className="daily-news-top-row">
                  <div className="daily-news-top-feature">
                    <article className="daily-news-feature">
                      <div className="daily-news-feature-media">
                        <Image
                          src={dailyFeatured.image}
                          alt={dailyFeatured.imageAlt}
                          fill
                          className="daily-news-feature-img"
                          sizes="(max-width:768px) 100vw, 28vw"
                          priority
                        />
                        <div className="daily-news-feature-overlay">
                          <h3 className="daily-news-feature-title mb-0">
                            <Link href={`/news/${dailyFeatured.slug}`} className="daily-news-feature-link">
                              {dailyFeatured.title}
                            </Link>
                          </h3>
                        </div>
                      </div>
                    </article>
                  </div>

                  <div className="daily-news-top-list">
                    <ul className="daily-news-list list-unstyled mb-0">
                      {dailyBullets.map((item) => (
                        <li key={item.slug} className="daily-news-list-item">
                          <Link href={`/news/${item.slug}`} className="daily-news-list-link">
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="daily-news-top-bottom row g-3 g-lg-4">
                  <div className="col-md-6">
                    <div className="row g-3 g-lg-4 daily-news-subgrid">
                      {dailyGridLeft.map((item) => (
                        <DailyGridCard key={item.slug} item={item} />
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row g-3 g-lg-4 daily-news-subgrid">
                      {dailyGridRight.map((item) => (
                        <DailyGridCard key={item.slug} item={item} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-3 trending-news-col">
            <SectionBroadcastHeader title="Trending News" href="/trending-news" className="mb-3" />
            <ComingSoonBlock
              compact
              title="Trending News coming soon"
              message="This section will go live once trending stories are published."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
