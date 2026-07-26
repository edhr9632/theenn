import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import SiteMasthead from "@/components/SiteMasthead";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = buildPageMetadata({
  title: "Newsletter",
  description:
    "Get Education News Network’s morning briefing and weekly education highlights delivered to your inbox.",
  path: "/newsletter",
  keywords: ["education newsletter", "ENN briefing", "school news email"],
});

const perks = [
  {
    title: "Morning briefing",
    copy: "The day’s essential education stories, curated before your first meeting.",
  },
  {
    title: "Weekly deep dive",
    copy: "Policy, classrooms, and ed-tech trends explained in plain language.",
  },
  {
    title: "Event alerts",
    copy: "Be first to know about North Summit and Education Today programmes.",
  },
];

export default function NewsletterPage() {
  return (
    <>
      <SiteMasthead />
      <main className="account-page">
        <section className="account-hero" aria-labelledby="newsletter-heading">
          <div className="container">
            <p className="account-hero-eyebrow text-uppercase mb-2 mb-lg-3">Free · Inbox essentials</p>
            <h1 id="newsletter-heading" className="account-hero-title serif-headline mb-3 mb-lg-4">
              ENN Newsletter
            </h1>
            <p className="account-hero-deck mb-0">
              Independent education journalism, delivered. No spam — just the stories educators and parents need.
            </p>
          </div>
        </section>

        <section className="account-body">
          <div className="container">
            <div className="row g-4 g-lg-5 align-items-start">
              <div className="col-lg-5">
                <div className="newsletter-perks">
                  {perks.map((perk, index) => (
                    <div key={perk.title} className="newsletter-perk">
                      <span className="newsletter-perk-num">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h2 className="newsletter-perk-title serif-headline mb-1">{perk.title}</h2>
                        <p className="newsletter-perk-copy mb-0">{perk.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-7">
                <div className="account-card">
                  <h2 className="account-card-title serif-headline mb-1">Join the list</h2>
                  <p className="account-card-sub mb-4">Enter your email — you can unsubscribe any time.</p>
                  <NewsletterForm source="newsletter-page" buttonLabel="Get the newsletter" />
                  <p className="account-fineprint mb-0 mt-4">
                    Want full access?{" "}
                    <Link href="/subscribe" className="account-inline-link">
                      View subscribe plans
                    </Link>
                    {" · "}
                    <Link href="/signin" className="account-inline-link">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
