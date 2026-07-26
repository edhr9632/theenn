"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";

export default function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/ask")) return null;
  if (pathname?.match(/^\/weekly-news\/[^/]+$/)) return null;
  return <SiteFooter />;
}
