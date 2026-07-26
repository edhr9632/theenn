import Link from "next/link";
import { AdminPageHeader, AdminBadge } from "@/components/admin/AdminUi";
import { newsArticles, panelDiscussions, speakers, sponsors, events } from "@/lib/data";
import { podcastShows } from "@/lib/podcasts";

export const metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  const stats = [
    { label: "News articles", value: newsArticles.length, href: "/admin/news" },
    { label: "Panel videos", value: panelDiscussions.length, href: "/admin/panels" },
    { label: "Podcast shows", value: podcastShows.length, href: "/admin/podcasts" },
    { label: "Events", value: events.length, href: "/admin/events" },
    { label: "Speakers", value: speakers.length, href: "/admin/speakers" },
    { label: "Sponsors", value: sponsors.length, href: "/admin/sponsors" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Manage ENN website content from one place. Connect APIs later to make everything dynamic."
      />

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-stat-card">
            <p className="admin-stat-label mb-1">{stat.label}</p>
            <p className="admin-stat-value mb-0">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="admin-panel mt-4">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title mb-0">Quick actions</h2>
        </div>
        <div className="admin-quick-actions">
          <Link href="/admin/ads" className="admin-quick-link">
            Manage ads
          </Link>
          <Link href="/admin/videos" className="admin-quick-link">
            Manage videos
          </Link>
          <Link href="/admin/news/daily/new" className="admin-quick-link">
            + Add daily news
          </Link>
          <Link href="/admin/news/weekly" className="admin-quick-link">
            + Weekly by city
          </Link>
          <Link href="/admin/categories" className="admin-quick-link">
            + Manage categories
          </Link>
          <Link href="/admin/panels/new" className="admin-quick-link">
            + Add panel
          </Link>
          <Link href="/admin/speakers/new" className="admin-quick-link">
            + Add speaker
          </Link>
          <Link href="/admin/contacts" className="admin-quick-link">
            View contact inbox
          </Link>
        </div>
      </div>

      <div className="admin-panel mt-4">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title mb-0">Latest news (preview)</h2>
          <AdminBadge>Ready for API</AdminBadge>
        </div>
        <ul className="admin-feed list-unstyled mb-0">
          {newsArticles.slice(0, 5).map((item) => (
            <li key={item.slug} className="admin-feed-item">
              <div>
                <p className="admin-feed-title mb-1">{item.title}</p>
                <p className="admin-feed-meta mb-0">
                  {item.category} · {item.date}
                </p>
              </div>
              <AdminBadge tone="green">Published</AdminBadge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
