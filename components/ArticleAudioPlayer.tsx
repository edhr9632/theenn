"use client";

import type { NewsArticle } from "@/lib/data";
import { buildArticleNewsScript, estimateListenMinutes } from "@/lib/articleAudio";
import EnnMediaPlayer from "@/components/EnnMediaPlayer";

type ArticleAudioPlayerProps = {
  article: Pick<NewsArticle, "title" | "excerpt" | "author" | "date" | "category" | "readTime" | "slug">;
  content?: string;
};

export default function ArticleAudioPlayer({ article, content = "" }: ArticleAudioPlayerProps) {
  const script = buildArticleNewsScript(article as NewsArticle, content);
  const listenTime = estimateListenMinutes(script);

  return (
    <EnnMediaPlayer
      title={article.title}
      showLabel={`ENN News · ${article.category}`}
      description={article.excerpt || "Listen to the full article."}
      durationLabel={listenTime}
      script={script}
      downloadUrl={`/api/article-audio/${encodeURIComponent(article.slug)}`}
      downloadFileName={`enn-${article.slug}-full-article.mp3`}
      brandTitle="ENN"
      brandSubtitle="NEWS"
    />
  );
}
