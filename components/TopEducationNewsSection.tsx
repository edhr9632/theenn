import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/lib/data";
import SectionBroadcastHeader from "./SectionBroadcastHeader";
import HomeListenNewsButton from "./HomeListenNewsButton";
import ComingSoonBlock from "./ComingSoonBlock";

function TopEduSideCard({ item, position }: { item: NewsArticle; position: string }) {
  return (
    <article className={`top-edu-side-card position-relative ${position}`}>
      <div className="top-edu-side-thumb">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          className="top-edu-card-image"
          sizes="(max-width:992px) 50vw, 22vw"
        />
      </div>
      <div className="top-edu-side-body">
        <span className="top-edu-side-tag">Top Education News</span>
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
  const featured = articles.find((item) => item.video) ?? articles[0];
  const sideStories = featured ? articles.filter((item) => item.slug !== featured.slug).slice(0, 4) : [];
  const sideLeft = sideStories.slice(0, 2);
  const sideRight = sideStories.slice(2, 4);
  const gridClass = [
    "top-edu-news-grid",
    sideLeft.length ? "has-left" : "",
    sideRight.length ? "has-right" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
            <div className={gridClass}>
              {sideLeft[0] ? <TopEduSideCard item={sideLeft[0]} position="top-edu-pos-l1" /> : null}
              {sideLeft[1] ? <TopEduSideCard item={sideLeft[1]} position="top-edu-pos-l2" /> : null}

              <article className="top-edu-feature position-relative top-edu-pos-feat">
                <div className="top-edu-feature-media ratio ratio-16x9">
                  <Image
                    src={featured.image}
                    alt={featured.imageAlt}
                    fill
                    className="top-edu-card-image"
                    sizes="(max-width:992px) 100vw, 50vw"
                    priority
                  />
                  {featured.video ? (
                    <Link href={`/news/${featured.slug}`} className="top-edu-watch-btn">
                      <span aria-hidden="true">▶</span> Watch now
                    </Link>
                  ) : null}
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

              {sideRight[0] ? <TopEduSideCard item={sideRight[0]} position="top-edu-pos-r1" /> : null}
              {sideRight[1] ? <TopEduSideCard item={sideRight[1]} position="top-edu-pos-r2" /> : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
