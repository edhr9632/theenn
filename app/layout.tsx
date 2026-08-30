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
    description: siteSeo.defaultDescription,
  }),
  referrer: "strict-origin-when-cross-origin",
  applicationName: siteSeo.siteName,
  category: "news",
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
        url: siteSeo.siteUrl,
        logo: `${siteSeo.siteUrl}${siteSeo.ogImage}`,
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
        description: siteSeo.defaultDescription,
        publisher: { "@id": `${siteSeo.siteUrl}/#organization` },
        inLanguage: "en-IN",
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
