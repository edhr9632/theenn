import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import AdminNewsRowActions from "@/components/admin/AdminNewsRowActions";
import AdminNewsTabs from "@/components/admin/AdminNewsTabs";
import { listNewsAdmin, mapNewsArticleRow } from "@/lib/newsDb";
import type { NewsSection } from "@/lib/newsTypes";

const SECTION_META: Record<
  NewsSection,
  { title: string; description: string; badge: string; newHref: string; editPrefix: string }
> = {
  top_education: {
    title: "Top Education News",
    description: "Stories shown in the Top Education News hero on the home page (max 5 recommended).",
    badge: "Top Education",
    newHref: "/admin/news/top-education/new",
    editPrefix: "/admin/news/top-education/edit",
  },
  daily: {
    title: "Daily News",
    description: "Day-to-day education stories shown under Daily News on the website.",
    badge: "Daily",
    newHref: "/admin/news/daily/new",
    editPrefix: "/admin/news/daily/edit",
  },
  trending: {
    title: "Trending News",
    description: "Stories gaining momentum — shown under Trending News.",
    badge: "Trending",
    newHref: "/admin/news/trending/new",
    editPrefix: "/admin/news/trending/edit",
  },
  press: {
    title: "Press Release",
    description: "Official announcements shown under Press Release.",
    badge: "Press",
    newHref: "/admin/news/press/new",
    editPrefix: "/admin/news/press/edit",
  },
};

export default async function AdminNewsSectionPage({ section }: { section: NewsSection }) {
  const meta = SECTION_META[section];
  let items: ReturnType<typeof mapNewsArticleRow>[] = [];
  let dbError = false;

  try {
    const rows = await listNewsAdmin(section);
    items = rows.map(mapNewsArticleRow);
  } catch (error) {
    dbError = true;
    console.error("[AdminNewsSectionPage]", section, error);
  }

  return (
    <div>
      <AdminPageHeader
        title={meta.title}
        description={meta.description}
        actionHref={meta.newHref}
        actionLabel="+ Add article"
      />
      <AdminNewsTabs />

      {dbError ? (
        <div className="admin-panel mt-3 p-4">
          <p className="mb-0 text-danger">
            Could not connect to PostgreSQL. Check DATABASE_URL and run <code>npm run db:migrate</code>.
          </p>
        </div>
      ) : null}

      <div className="admin-panel mt-3">
        <AdminTable columns={["Title", "Category", "Author", "Date", "Status", "Actions"]}>
          {items.length ? (
            items.map((item) => (
              <tr key={`${section}-${item.slug}`}>
                <td>
                  <p className="admin-cell-title mb-0">{item.title}</p>
                  <p className="admin-cell-sub mb-0">{item.slug}</p>
                </td>
                <td>
                  <AdminBadge>{item.category}</AdminBadge>
                </td>
                <td>{item.author}</td>
                <td>{item.date}</td>
                <td>
                  <AdminBadge tone="green">{meta.badge}</AdminBadge>
                </td>
                <td>
                  <AdminNewsRowActions
                    slug={item.slug}
                    title={item.title}
                    editHref={`${meta.editPrefix}/${encodeURIComponent(item.slug)}`}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <p className="mb-0 text-muted py-3">
                  No articles yet. Click <strong>+ Add article</strong> to publish {meta.title.toLowerCase()}.
                </p>
              </td>
            </tr>
          )}
        </AdminTable>
      </div>
    </div>
  );
}
