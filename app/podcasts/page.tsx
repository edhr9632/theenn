import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Podcasts",
  description:
    "Listen to Education News Network podcasts — Knowledge Plus, ENN Daily Brief, Classroom Voices, and more.",
  path: "/podcasts",
  keywords: ["education podcasts", "ENN Daily Brief", "Knowledge Plus", "Classroom Voices"],
});

export default function PodcastsIndexPage() {
  redirect("/podcasts/knowledge-plus");
}
