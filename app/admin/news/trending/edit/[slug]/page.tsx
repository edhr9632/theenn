import AdminNewsSectionEditPage from "@/components/admin/AdminNewsSectionEditPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AdminNewsSectionEditPage section="trending" slug={slug} />;
}
