import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/lib/data";
import SectionBroadcastHeader from "./SectionBroadcastHeader";
import HomeListenNewsButton from "./HomeListenNewsButton";
import ComingSoonBlock from "./ComingSoonBlock";

function TopEduSideCard({ item }: { item: NewsArticle }) {
  return (
    <article className="top-edu-side-card position-relative">
      <div className="top-edu-side-thumb">
        <Image src={item.image} alt={item.imageAlt} fill className="object-fit-cover" sizes="(max-width:992px) 50vw, 22vw" />
      </div>
      <div className="top-edu-side-body">
        <span className="top-edu-side-tag">{item.category}</span>
        <h4 className="top-edu-side-title">
          <Link href={`/news/${item.slug}`} className="top-edu-side-link stretched-link">
            {item.title}
          </Link>
        </h4>
      </div>
    </article>
  );
}

type TopEducationNewsSectionProps = {
  articles: NewsArticle[];
};

export default function TopEducationNewsSection({ articles }: TopEducationNewsSectionProps) {
  const featured = articles[0];
  const sideStories = articles.slice(1, 5);
  const sideLeft = sideStories.slice(0, 2);
  const sideRight = sideStories.slice(2, 4);

  return (
    <section className="top-edu-news-section" aria-labelledby="top-edu-news-heading">
      <div className="container">
        <SectionBroadcastHeader
          id="top-edu-news-heading"
          title="Top Education News"
          action={<HomeListenNewsButton />}
        />

        {!featured ? (
          <ComingSoonBlock
            title="Top Education News coming soon"
            message="Add stories under Admin → News → Top Education News to show them here."
          />
        ) : (
          <div className="top-edu-news-board">
            <div className="row g-3 g-lg-4 align-items-stretch top-edu-news-grid">
              <div className="col-lg-3 order-lg-1 d-none d-lg-flex min-h-0">
                <div className="top-edu-side-stack w-100">
                  {sideLeft.map((item) => (
                    <TopEduSideCard key={item.slug} item={item} />
                  ))}
                </div>
              </div>

              <div className="col-lg-6 order-lg-2 order-1 d-flex min-h-0">
                <article className="top-edu-feature position-relative w-100">
                  <div className="top-edu-feature-media">
                    <Image
                      src={featured.image}
                      alt={featured.imageAlt}
                      fill
                      className="object-fit-cover"
                      sizes="(max-width:992px) 100vw, 50vw"
                      priority
                    />
                    {featured.video && (
                      <a href="#" className="top-edu-watch-btn">
                        <span aria-hidden="true">▶</span> Watch now
                      </a>
                    )}
                  </div>
                  <div className="top-edu-feature-body">
                    <span className="top-edu-feature-tag">Top Education News</span>
                    <h3 className="top-edu-feature-title">
                      <Link href={`/news/${featured.slug}`} className="top-edu-feature-link stretched-link">
                        {featured.title}
                      </Link>
                    </h3>
                    <p className="top-edu-feature-excerpt">{featured.excerpt}</p>
                    <p className="top-edu-feature-meta">
                      {featured.author} · {featured.date} · {featured.readTime}
                    </p>
                  </div>
                </article>
              </div>

              <div className="col-lg-3 order-lg-3 d-none d-lg-flex min-h-0">
                <div className="top-edu-side-stack w-100">
                  {sideRight.map((item) => (
                    <TopEduSideCard key={item.slug} item={item} />
                  ))}
                </div>
              </div>
            </div>

            <div className="top-edu-mobile-grid d-lg-none">
              {sideStories.map((item) => (
                <TopEduSideCard key={`mobile-${item.slug}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
