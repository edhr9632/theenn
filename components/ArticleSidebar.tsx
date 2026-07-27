import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/lib/data";

type ArticleSidebarProps = {
  related?: NewsArticle[];
};

export default function ArticleSidebar({ related = [] }: ArticleSidebarProps) {
  return (
    <aside className="col-lg-4" aria-label="Article sidebar">
      <div className="article-sidebar sticky-lg-top">
        <section className="article-sidebar-block bg-white rounded-3 shadow-sm p-3 p-md-4 mb-4" aria-labelledby="sidebar-categories-heading">
          <h2 id="sidebar-categories-heading" className="article-sidebar-title serif-headline h6 mb-3 pb-2 border-bottom">
            Categories
          </h2>
          <ul className="list-unstyled article-category-list mb-0">
            <li>
              <Link href="/news" className="article-category-link d-flex justify-content-between align-items-center">
                <span>Daily News</span>
              </Link>
            </li>
            <li>
              <Link href="/trending-news" className="article-category-link d-flex justify-content-between align-items-center">
                <span>Trending</span>
              </Link>
            </li>
            <li>
              <Link href="/press-release" className="article-category-link d-flex justify-content-between align-items-center">
                <span>Press Release</span>
              </Link>
            </li>
            <li>
              <Link href="/weekly-news" className="article-category-link d-flex justify-content-between align-items-center">
                <span>Weekly News</span>
              </Link>
            </li>
          </ul>
        </section>

        <section className="article-sidebar-ad mb-4" aria-label="Advertisement">
          <div className="article-ad-pulse rounded-3 p-3 p-md-4 text-center text-white">
            <p className="article-ad-label text-uppercase small fw-semibold mb-2">Partner · Advertisement</p>
            <p className="article-ad-title serif-headline h6 mb-2">Looking for school admission?</p>
            <p className="article-ad-copy small mb-3 opacity-90">
              Visit MSA — My School Admission. Compare schools and apply with confidence.
            </p>
            <a
              href="https://myschooladmission.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn article-ad-btn btn-sm fw-semibold"
            >
              Visit MSA
            </a>
          </div>
        </section>

        {related.length ? (
          <section className="article-sidebar-block bg-white rounded-3 shadow-sm p-3 p-md-4 mb-4" aria-labelledby="sidebar-related-heading">
            <h2 id="sidebar-related-heading" className="article-sidebar-title serif-headline h6 mb-3 pb-2 border-bottom">
              Related stories
            </h2>
            <ul className="list-unstyled article-related-list mb-0">
              {related.map((item) => (
                <li key={item.slug} className="article-related-item">
                  <Link href={`/news/${item.slug}`} className="article-related-link d-flex gap-3 text-decoration-none">
                    <div className="article-related-thumb flex-shrink-0 rounded-2 overflow-hidden position-relative">
                      <Image src={item.image} alt="" width={72} height={54} className="object-fit-cover" />
                    </div>
                    <span className="article-related-title serif-headline small text-navy">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="article-sidebar-ad" aria-label="Advertisement">
          <div className="article-ad-banner rounded-3 d-flex flex-column justify-content-center align-items-center text-center p-4">
            <p className="article-ad-banner-label text-uppercase small fw-bold mb-2">Advertisement</p>
            <p className="article-ad-banner-title serif-headline h6 mb-1 text-navy">Education Today Magazine</p>
            <p className="small text-secondary mb-3">Weekly editions from Education News Network.</p>
            <a href="/weekly-news" className="btn btn-sm btn-outline-primary fw-semibold">
              Browse weekly news
            </a>
          </div>
        </section>
      </div>
    </aside>
  );
}
