import type { MetadataRoute } from "next";
import { siteSeo } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin", "/signin"],
      },
    ],
    sitemap: `${siteSeo.siteUrl}/sitemap.xml`,
    host: siteSeo.siteUrl,
  };
}
