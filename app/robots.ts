import type { MetadataRoute } from "next";
import { siteSeo } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin", "/signin", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/admin", "/signin", "/api/"],
      },
    ],
    sitemap: `${siteSeo.siteUrl}/sitemap.xml`,
    host: siteSeo.siteUrl,
  };
}
