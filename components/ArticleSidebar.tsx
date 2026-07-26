import Link from "next/link";
import Image from "next/image";
import { categories, newsArticles } from "@/lib/data";
import type { NewsArticle } from "@/lib/data";

type ArticleSidebarProps = {
  related?: NewsArticle[];
};

export default function ArticleSidebar({ related = newsArticles.slice(1, 4) }: ArticleSidebarProps) {
  return (
    <aside className="col-lg-4" aria-label="Article sidebar">
      <div className="article-sidebar sticky-lg-top">
        <section className="article-sidebar-block bg-white rounded-3 shadow-sm p-3 p-md-4 mb-4" aria-labelledby="sidebar-categories-heading">
          <h2 id="sidebar-categories-heading" className="article-sidebar-title serif-headline h6 mb-3 pb-2 border-bottom">Categories</h2>
          <ul className="list-unstyled article-category-list mb-0">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link href={cat.href ?? "/news"} className="article-category-link d-flex justify-content-between align-items-center">
                  <span>{cat.name}</span>
                  <span className="article-category-count">{cat.count}</span>
                </Link>
              </li>
            ))}
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

        <section className="article-sidebar-block bg-white rounded-3 shadow-sm p-3 p-md-4 mb-4" aria-labelledby="sidebar-related-heading">
          <h2 id="sidebar-related-heading" className="article-sidebar-title serif-headline h6 mb-3 pb-2 border-bottom">Related stories</h2>
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

        <section className="article-sidebar-ad" aria-label="Advertisement">
          <div className="article-ad-banner rounded-3 d-flex flex-column justify-content-center align-items-center text-center p-4">
            <p className="article-ad-banner-label text-uppercase small fw-bold mb-2">Advertisement</p>
            <p className="article-ad-banner-title serif-headline h6 mb-1 text-navy">Education Today Magazine</p>
            <p className="small text-secondary mb-3">Issue 04 · April 2026 — classrooms reimagined.</p>
            <a href="#" className="btn btn-sm btn-outline-primary fw-semibold">Read the edition</a>
          </div>
        </section>
      </div>
    </aside>
  );
}
