import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function LegacyNewsEditRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/admin/news/daily/edit/${slug}`);
}
