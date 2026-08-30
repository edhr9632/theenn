import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/lib/data";

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" className="opacity-75 flex-shrink-0" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
    </svg>
  );
}

type MostReadBlockProps = {
  articles: NewsArticle[];
  title?: string;
};

export default function MostReadBlock({ articles, title = "Recent Blogs" }: MostReadBlockProps) {
  return (
    <div className="most-read-block bg-white rounded-3 shadow-sm p-3 p-md-4">
      <h3 className="most-read-title serif-headline mb-0 pb-2">{title}</h3>
      <ul className="list-unstyled mb-0 most-read-list">
        {articles.map((item) => (
          <li key={item.slug} className="most-read-item">
            <Link href={`/news/${item.slug}`} className="most-read-link d-flex gap-3 align-items-center text-decoration-none">
              <div className="most-read-thumb flex-shrink-0 rounded-2 overflow-hidden position-relative">
                <Image src={item.image} alt="" fill className="object-fit-cover" sizes="72px" />
              </div>
              <div className="min-w-0">
                <span className="most-read-cat text-uppercase small fw-semibold d-block">{item.category}</span>
                <span className="most-read-headline d-block text-navy serif-headline">{item.title}</span>
                <span className="most-read-time small text-muted d-flex align-items-center gap-1 mt-1">
                  <ClockIcon />
                  {item.readTime}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
