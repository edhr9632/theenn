import SiteMasthead from "@/components/SiteMasthead";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

export const metadata = buildPageMetadata({
  title: PAGE_SEO.podcasts.title,
  description: PAGE_SEO.podcasts.description,
  path: "/podcasts",
  keywords: [...PAGE_SEO.podcasts.keywords],
});

export default function PodcastsIndexPage() {
  return (
    <>
      <SiteMasthead activeNav="podcasts" />
      <main className="news-page">
        <section className="news-hero" aria-labelledby="podcasts-hero-heading">
          <div className="container">
            <p className="news-hero-eyebrow text-uppercase mb-2 mb-lg-3">Podcasts</p>
            <h1 id="podcasts-hero-heading" className="news-hero-title serif-headline mb-3 mb-lg-4">
              ENN Podcasts
            </h1>
            <p className="news-hero-deck mb-0">
              Knowledge Plus and other ENN shows will appear here once published from the admin panel.
            </p>
          </div>
        </section>
        <div className="container py-4 py-lg-5">
          <ComingSoonBlock
            title="Podcasts coming soon"
            message="Add Knowledge Plus and other shows in admin — they will list here automatically. The Knowledge Plus TV banner on the homepage still comes from the backend promo."
          />
        </div>
      </main>
    </>
  );
}
