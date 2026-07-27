import type { Metadata } from "next";
import SiteMasthead from "@/components/SiteMasthead";
import PanelDiscussionCard from "@/components/PanelDiscussionCard";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import { isDbConfigured } from "@/lib/db";
import { getPanelDiscussionsFromDb } from "@/lib/panelsDb";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Panel Discussions",
  description:
    "Watch all Education News Network panel discussions with education leaders, policymakers, and experts.",
  path: "/panel-discussions",
  keywords: ["education panel discussions", "ENN panels", "education leaders youtube"],
});

export const dynamic = "force-dynamic";

export default async function PanelDiscussionsPage() {
  let panels: Awaited<ReturnType<typeof getPanelDiscussionsFromDb>> = [];
  if (isDbConfigured()) {
    try {
      panels = await getPanelDiscussionsFromDb(100);
    } catch (error) {
      console.error("[PanelDiscussionsPage]", error);
    }
  }

  return (
    <>
      <SiteMasthead activeNav="panel" />
      <main className="news-page panel-all-page">
        <section className="news-hero" aria-labelledby="panels-hero-heading">
          <div className="container">
            <p className="news-hero-eyebrow text-uppercase mb-2 mb-lg-3">Video · Conversations</p>
            <h1 id="panels-hero-heading" className="news-hero-title serif-headline mb-3 mb-lg-4">
              Panel Discussions
            </h1>
            <p className="news-hero-deck mb-0">
              Every ENN panel in one place — click any discussion to watch on YouTube.
            </p>
          </div>
        </section>

        <section className="panel-all-body" aria-labelledby="panels-grid-heading">
          <div className="container py-4 py-lg-5">
            {!panels.length ? (
              <ComingSoonBlock
                title="Panel discussions coming soon"
                message="Add panels in the admin panel — they will appear here automatically."
              />
            ) : (
              <>
                <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
                  <div>
                    <h2 id="panels-grid-heading" className="panel-all-grid-title serif-headline mb-1">
                      All panels
                    </h2>
                    <p className="panel-all-grid-sub mb-0">
                      {panels.length} discussion{panels.length === 1 ? "" : "s"} available
                    </p>
                  </div>
                </div>

                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {panels.map((panel) => (
                    <div key={panel.episode} className="col">
                      <PanelDiscussionCard panel={panel} sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
