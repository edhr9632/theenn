import Image from "next/image";
import { toVideoEmbedHtml } from "@/lib/videoEmbed";

type ArticleHeroMediaProps = {
  featuredVideo?: string | null;
  imageUrl?: string | null;
  imageAlt: string;
  caption?: string;
};

export default function ArticleHeroMedia({
  featuredVideo,
  imageUrl,
  imageAlt,
  caption,
}: ArticleHeroMediaProps) {
  const embedHtml = featuredVideo ? toVideoEmbedHtml(featuredVideo) : null;
  const image = imageUrl?.trim();

  if (embedHtml) {
    return (
      <figure className="article-hero-figure mb-4 mb-lg-5">
        <div className="article-hero-media article-hero-video rounded-3 overflow-hidden shadow-sm">
          <div className="article-content" dangerouslySetInnerHTML={{ __html: embedHtml }} />
        </div>
        {caption ? <figcaption className="article-caption small text-muted mt-2 mb-0">{caption}</figcaption> : null}
      </figure>
    );
  }

  if (image) {
    return (
      <figure className="article-hero-figure mb-4 mb-lg-5">
        <div className="article-hero-media ratio ratio-21x9 rounded-3 overflow-hidden shadow-sm bg-light position-relative">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-fit-cover"
            sizes="(max-width:992px) 100vw, 66vw"
            priority
          />
        </div>
        {caption ? <figcaption className="article-caption small text-muted mt-2 mb-0">{caption}</figcaption> : null}
      </figure>
    );
  }

  return null;
}
