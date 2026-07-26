import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/lib/data";

export default function NewsArchiveCard({ article }: { article: NewsArticle }) {
  return (
    <article className="news-archive-card h-100 bg-white rounded-3 shadow-sm overflow-hidden d-flex flex-column position-relative">
      <div className="news-archive-media ratio ratio-4x3 position-relative">
        <Image src={article.image} alt={article.imageAlt} fill className="object-fit-cover" sizes="(max-width:768px) 100vw, 33vw" />
        {article.video && <span className="news-card-video-badge">▶ Video</span>}
      </div>
      <div className="news-archive-body d-flex flex-column flex-grow-1 p-3 p-md-4">
        <span className="news-archive-cat text-uppercase small fw-semibold">{article.category}</span>
        <h3 className="news-archive-headline serif-headline mt-2 mb-2">
          <Link href={`/news/${article.slug}`} className="news-archive-title-link text-decoration-none text-navy stretched-link">
            {article.title}
          </Link>
        </h3>
        <p className="news-archive-excerpt small text-secondary flex-grow-1 mb-3">{article.excerpt}</p>
        <p className="news-archive-meta small text-muted mb-0 mt-auto d-flex flex-wrap align-items-center gap-2">
          <span>
            {article.author} · {article.readTime}
          </span>
          <span className="news-archive-listen">🎧 Listen</span>
        </p>
      </div>
    </article>
  );
}
