import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seoKeywords";
import Link from "next/link";
import SiteMasthead from "@/components/SiteMasthead";
import SubscribePlans from "@/components/SubscribePlans";

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.subscribe.title,
  description: PAGE_SEO.subscribe.description,
  path: "/subscribe",
  keywords: [...PAGE_SEO.subscribe.keywords],
});

export default function SubscribePage() {
  return (
    <>
      <SiteMasthead />
      <main className="account-page">
        <section className="account-hero" aria-labelledby="subscribe-heading">
          <div className="container">
            <p className="account-hero-eyebrow text-uppercase mb-2 mb-lg-3">Support independent education journalism</p>
            <h1 id="subscribe-heading" className="account-hero-title serif-headline mb-3 mb-lg-4">
              Subscribe to ENN
            </h1>
            <p className="account-hero-deck mb-0">
              Choose a plan that fits how you read — from daily briefings to premium access with event benefits.
            </p>
          </div>
        </section>

        <section className="account-body">
          <div className="container">
            <SubscribePlans />
            <p className="account-crosslinks text-center mb-0 mt-4">
              Looking for free updates?{" "}
              <Link href="/newsletter" className="account-inline-link">
                Join the newsletter
              </Link>
              {" · "}
              <Link href="/signin" className="account-inline-link">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
