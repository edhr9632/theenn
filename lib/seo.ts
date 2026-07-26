import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ennnews.com";
const SITE_NAME = "Education News Network";
const DEFAULT_DESCRIPTION =
  "Independent education journalism from Education News Network — daily news, weekly magazines, panel discussions, summits, and insights for schools, educators, and parents.";

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
};

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = siteSeo.ogImage,
  keywords = [
    "education news",
    "ENN",
    "Education Today",
    "school admission",
    "educators summit",
    "panel discussions",
    "K-12 leadership",
  ],
  noIndex = false,
}: BuildMetadataInput = {}): Metadata {
  const pageTitle = title ?? SITE_NAME;
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: title
      ? {
          absolute: `${title} | ${SITE_NAME}`,
        }
      : {
          default: SITE_NAME,
          template: `%s | ${SITE_NAME}`,
        },
    description,
    keywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: siteSeo.locale,
      url,
      siteName: SITE_NAME,
      title: pageTitle === SITE_NAME ? SITE_NAME : `${pageTitle} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle === SITE_NAME ? SITE_NAME : `${pageTitle} | ${SITE_NAME}`,
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
