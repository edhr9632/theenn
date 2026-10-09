import type { Metadata } from "next";
import { Playfair_Display, Roboto } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapClient from "@/components/BootstrapClient";
import ConditionalSiteFooter from "@/components/ConditionalSiteFooter";
import AskEnnOverlay from "@/components/AskEnnOverlay";
import EnnAssistant from "@/components/EnnAssistant";
import FloatingNowPlayingLoader from "@/components/FloatingNowPlayingLoader";
import FestivalPopup from "@/components/FestivalPopup";
import { buildPageMetadata, siteSeo } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-roboto",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  ...buildPageMetadata({
    path: "/",
    title: PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    keywords: [...PAGE_SEO.home.keywords],
  }),
  referrer: "strict-origin-when-cross-origin",
  applicationName: siteSeo.siteName,
  category: "Education News",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: "/images/Enn_logo1.png",
    apple: "/images/Enn_logo1.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsMediaOrganization",
        "@id": `${siteSeo.siteUrl}/#organization`,
        name: siteSeo.siteName,
        alternateName: ["ENN", "Education Today", "theenn"],
        url: siteSeo.siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteSeo.siteUrl}${siteSeo.ogImage}`,
        },
        description: siteSeo.defaultDescription,
        foundingLocation: {
          "@type": "Place",
          name: "Bengaluru, Karnataka, India",
        },
        areaServed: "IN",
        sameAs: [
          "https://www.youtube.com/@educationtoday7909",
          "https://www.facebook.com/edutodayk12/",
          "https://www.instagram.com/educationtodayk12",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteSeo.siteUrl}/#website`,
        url: siteSeo.siteUrl,
        name: siteSeo.siteName,
        alternateName: "theenn.com",
        description: siteSeo.defaultDescription,
        publisher: { "@id": `${siteSeo.siteUrl}/#organization` },
        inLanguage: "en-IN",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteSeo.siteUrl}/ask?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${playfair.variable}`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BootstrapClient />
        {children}
        <ConditionalSiteFooter />
        <FloatingNowPlayingLoader />
        <FestivalPopup />
        <AskEnnOverlay />
        <EnnAssistant />
      </body>
    </html>
  );
}
