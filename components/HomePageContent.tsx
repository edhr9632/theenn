import Link from "next/link";
import Image from "next/image";
import { getHomePageData } from "@/lib/homeContent";
import HomeSurveyBanner from "./HomeSurveyBanner";
import TopEducationNewsSection from "./TopEducationNewsSection";
import HomeSponsorBanner from "./HomeSponsorBanner";
import DailyTrendingNews from "./DailyTrendingNews";
import SectionBroadcastHeader from "./SectionBroadcastHeader";
import ComingSoonBlock from "./ComingSoonBlock";
import MostReadBlock from "./MostReadBlock";
import HomePartnerBanner from "./HomePartnerBanner";
import HomeShortVideosSection from "./HomeShortVideosSection";
import HomeVideosSection from "./HomeVideosSection";

export default async function HomePageContent() {
  const home = await getHomePageData();

  return (
    <>
      <main className="main-area py-4 py-lg-5">
        <div className="container">
          <HomeSurveyBanner />
        </div>

        <TopEducationNewsSection articles={home.topEducation} />

        <HomeSponsorBanner banner={home.tvSchedule} />

        <DailyTrendingNews daily={home.daily} trending={home.trending} />

        <section className="latest-coverage pt-5 pb-4" aria-labelledby="latest-coverage-heading">
          <div className="container">
            <SectionBroadcastHeader
              id="latest-coverage-heading"
              title="Latest Coverage"
              href="/news"
              action={
                <Link href="/news" className="section-broadcast-action-link">
                  All news <span aria-hidden="true">→</span>
                </Link>
              }
              className="mb-4"
            />
            {!home.latest.length ? (
              <ComingSoonBlock
                title="Latest Coverage coming soon"
                message="Published daily news will appear here automatically."
              />
            ) : (
              <div className="row g-4 g-lg-4 align-items-lg-start">
                <div className="col-lg-8">
                  <div className="latest-grid">
                    {home.latest.map((item) => (
                      <article
                        key={item.slug}
                        className="latest-card position-relative d-flex flex-column bg-white rounded-3 shadow-sm overflow-hidden h-100"
                      >
                        <div className="ratio ratio-4x3 latest-card-media position-relative">
                          <Image
                            src={item.image}
                            alt={item.imageAlt}
                            fill
                            className="object-fit-cover"
                            sizes="(max-width:992px) 100vw, 50vw"
                          />
                        </div>
                        <div className="latest-card-body d-flex flex-column flex-grow-1 p-3 p-md-4">
                          <span className="latest-card-cat text-uppercase small fw-semibold">{item.category}</span>
                          <h3 className="latest-card-headline serif-headline mt-2 mb-2">
                            <Link
                              href={`/news/${item.slug}`}
                              className="latest-card-title-link text-decoration-none text-navy stretched-link"
                            >
                              {item.title}
                            </Link>
                          </h3>
                          <p className="latest-card-excerpt small text-secondary flex-grow-1 mb-3">{item.excerpt}</p>
                          <p className="latest-card-meta small text-muted mb-0 mt-auto">
                            {item.author} · {item.readTime}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="morning-wire-box text-white mb-4">
                    <p className="morning-wire-eyebrow small fw-semibold mb-2">Issue 04 · April 2026</p>
                    <h3 className="morning-wire-title mb-3">Education Today Magazine</h3>
                    <p className="morning-wire-deck mb-4">
                      The future of learning, classrooms reimagined, and the leaders shaping the next generation.
                    </p>
                    <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3">
                      <a href="/weekly-news" className="btn morning-wire-btn-primary fw-semibold">
                        Read more →
                      </a>
                      <Link href="/subscribe" className="btn morning-wire-btn-ghost fw-semibold">
                        Subscribe
                      </Link>
                    </div>
                  </div>
                  {home.mostRead.length ? (
                    <MostReadBlock articles={home.mostRead} title="Recent Blogs" />
                  ) : (
                    <ComingSoonBlock
                      compact
                      title="Recent Blogs coming soon"
                      message="Published blogs will appear here automatically."
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <HomePartnerBanner banner={home.partnerBanner} />
      </main>

      <HomeShortVideosSection dbShortVideos={home.shortVideos} />
      <HomeVideosSection dbVideosConfig={home.videosConfig} dbPanels={home.panels} />
    </>
  );
}
