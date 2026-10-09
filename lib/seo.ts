import type { Metadata } from "next";
import { ARTICLE_SEO_KEYWORDS, CORE_HIGH_VOLUME, BRAND_KEYWORDS } from "@/lib/seoKeywords";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.theenn.com").replace(/\/$/, "");
const SITE_NAME = "Education News Network";
const DEFAULT_DESCRIPTION =
  "Latest education news India — CBSE updates, school admissions, NEET & JEE headlines, education policy, educators’ summits, and weekly magazines from Education News Network (ENN).";

export const siteSeo = {
  siteUrl: SITE_URL,
  siteName: SITE_NAME,
  defaultTitle: SITE_NAME,
  defaultDescription: DEFAULT_DESCRIPTION,
  twitterHandle: "@educationtoday",
  locale: "en_IN",
  ogImage: "/images/Enn_logo1.png",
};

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}` || SITE_URL;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = siteSeo.ogImage,
  keywords = [...CORE_HIGH_VOLUME, ...BRAND_KEYWORDS],
  noIndex = false,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: BuildMetadataInput = {}): Metadata {
  const pageTitle = title ?? SITE_NAME;
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  const fullTitle = pageTitle === SITE_NAME ? SITE_NAME : `${pageTitle} | ${SITE_NAME}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: title
      ? {
          absolute: fullTitle,
        }
      : {
          default: `${SITE_NAME} | Education News India`,
          template: `%s | ${SITE_NAME}`,
        },
    description,
    keywords: [...new Set(keywords.map((k) => k.trim()).filter(Boolean))],
    authors: (authors?.length ? authors : [SITE_NAME]).map((name) => ({ name })),
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Education",
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: siteSeo.locale,
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors: authors?.length ? authors : [SITE_NAME],
            section: "Education",
            tags: keywords.slice(0, 8),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: siteSeo.twitterHandle,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function buildArticleMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string | null;
}): Metadata {
  const keywords = [
    ...(input.keywords ?? []),
    ...ARTICLE_SEO_KEYWORDS,
  ];
  return buildPageMetadata({
    title: input.title,
    description: input.description || DEFAULT_DESCRIPTION,
    path: input.path,
    image: input.image,
    keywords,
    type: "article",
    publishedTime: input.publishedTime ?? undefined,
    authors: input.author ? [input.author, SITE_NAME] : [SITE_NAME],
  });
}

export function buildNewsArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  author?: string;
  publishedTime?: string | null;
  modifiedTime?: string | null;
}) {
  const url = absoluteUrl(input.path);
  const imageUrl = input.image
    ? input.image.startsWith("http")
      ? input.image
      : `${SITE_URL}${input.image.startsWith("/") ? input.image : `/${input.image}`}`
    : `${SITE_URL}${siteSeo.ogImage}`;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.description,
    image: [imageUrl],
    datePublished: input.publishedTime || undefined,
    dateModified: input.modifiedTime || input.publishedTime || undefined,
    author: {
      "@type": "Person",
      name: input.author || SITE_NAME,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${siteSeo.ogImage}`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    isAccessibleForFree: true,
    inLanguage: "en-IN",
  };
}
