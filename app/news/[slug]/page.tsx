import Link from "next/link";
import { notFound } from "next/navigation";
import SiteMasthead from "@/components/SiteMasthead";
import ArticleSidebar from "@/components/ArticleSidebar";
import ArticleAudioPlayer from "@/components/ArticleAudioPlayer";
import ArticleHeroMedia from "@/components/ArticleHeroMedia";
import ArticleShareBar from "@/components/ArticleShareBar";
import ArticleAskAiFloat from "@/components/ArticleAskAiFloat";
import ArticleFaqSection from "@/components/ArticleFaqSection";
import ArticleComments from "@/components/ArticleComments";
import {
  buildArticleFaqs,
  buildArticleSuggestedQuestions,
  extractArticleKeywords,
  toArticleAskContext,
} from "@/lib/articleAskAi";
import { listApprovedComments } from "@/lib/commentsDb";
import { getPublishedNewsDetail } from "@/lib/newsDb";
import { buildPageMetadata } from "@/lib/seo";
import type { NewsSection } from "@/lib/newsTypes";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const SECTION_NAV: Record<
  NewsSection,
  { label: string; href: string; newsActive: "daily" | "trending" | "press" }
> = {
  daily: { label: "Daily", href: "/news", newsActive: "daily" },
  trending: { label: "Trending", href: "/trending-news", newsActive: "trending" },
  press: { label: "Press Release", href: "/press-release", newsActive: "press" },
  top_education: { label: "Top Education", href: "/news", newsActive: "daily" },
};

async function resolveArticle(slug: string) {
  try {
    const fromDb = await getPublishedNewsDetail(slug);
    if (fromDb) return fromDb;
  } catch {
    /* database unavailable */
  }
  return null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveArticle(slug);
  if (!resolved) return { title: "Article not found" };

  const { article } = resolved;
  return buildPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    image: article.image,
    keywords: [article.category, "education news", "ENN", article.author],
  });
}

function ArticleBody({ content }: { content: string }) {
  if (content) {
    return <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <div className="article-content">
      <p className="mb-0 text-secondary">Full article content will appear here once published from the admin panel.</p>
    </div>
  );
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveArticle(slug);
  if (!resolved) notFound();

  const { article, content, section, publishDateIso, featuredVideo, imageUrl, imageAlt } = resolved;
  const sectionNav = SECTION_NAV[section];

  let comments: Awaited<ReturnType<typeof listApprovedComments>> = [];

  try {
    comments = await listApprovedComments(slug);
  } catch {
    /* comments unavailable */
  }

  const askCtx = toArticleAskContext(article, content);
  const askSuggestions = buildArticleSuggestedQuestions(askCtx);
  const faqs = buildArticleFaqs(askCtx);
  const keywords = extractArticleKeywords(askCtx, 6);
  // Hide “points”/highlights on the article page (we still speak/read the full article via the audio player).
  const listenHighlights: string[] = [];

  return (
    <>
      <SiteMasthead activeNav="news" newsActive={sectionNav.newsActive} />
      <main className="news-article-page">
        <div className="container py-4 py-lg-5">
          <nav className="article-breadcrumb mb-3 mb-lg-4" aria-label="Breadcrumb">
            <ol className="breadcrumb article-breadcrumb-list mb-0">
              <li className="breadcrumb-item">
                <Link href="/news">News</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href={sectionNav.href}>{sectionNav.label}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {article.category}
              </li>
            </ol>
          </nav>

          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-lg-8">
              <article className="article-main">
                <span className="article-cat text-uppercase small fw-semibold">{article.category}</span>
                <h1 className="article-title serif-headline mt-2 mb-3">{article.title}</h1>
                <div className="article-meta d-flex flex-wrap align-items-center gap-2 gap-md-3 small text-muted mb-3 mb-lg-4 pb-3 border-bottom">
                  <span className="article-author fw-semibold text-navy">{article.author}</span>
                  <span className="article-meta-dot" aria-hidden="true">
                    •
                  </span>
                  <time dateTime={publishDateIso ?? undefined}>{article.date}</time>
                  <span className="article-meta-dot" aria-hidden="true">
                    •
                  </span>
                  <span>{article.readTime}</span>
                </div>

                <ArticleAudioPlayer
                  article={article}
                  content={content}
                  keywords={keywords}
                  highlights={listenHighlights}
                />

                <ArticleHeroMedia
                  featuredVideo={featuredVideo}
                  imageUrl={featuredVideo ? "" : imageUrl}
                  imageAlt={imageAlt}
                />

                {article.excerpt ? (
                  <div className="article-lede-block mb-4">
                    <p className="article-lede mb-0">{article.excerpt}</p>
                  </div>
                ) : null}
                <ArticleBody content={content} />
              </article>
            </div>
            <ArticleSidebar />
          </div>

          <div className="article-engagement-full">
            <ArticleShareBar
              title={article.title}
              excerpt={article.excerpt}
              path={`/news/${article.slug}`}
            />

            <ArticleFaqSection
              title={article.title}
              excerpt={article.excerpt}
              author={article.author}
              date={article.date}
              category={article.category}
              path={`/news/${article.slug}`}
              image={article.image || undefined}
              faqs={faqs}
            />

            <ArticleComments slug={slug} initialComments={comments} />
          </div>
        </div>
      </main>

      <ArticleAskAiFloat
        slug={slug}
        articleTitle={article.title}
        suggestions={askSuggestions}
        keywords={keywords}
      />
    </>
  );
}
