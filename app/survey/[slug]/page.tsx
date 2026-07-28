import { notFound, redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";
import {
  DEFAULT_SURVEY_FORM_URL,
  SURVEY_SLUG,
  getSurveyConfig,
} from "@/lib/survey";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  path: "/survey",
  title: "Dynamic School Survey 2026",
  description: "Dynamic School - South India Educators' Summit Survey and Nomination Form 2026.",
});

export default function SurveyRedirectPage({ params }: { params: { slug: string } }) {
  if (params.slug !== SURVEY_SLUG) notFound();
  const target = getSurveyConfig().directUrl?.trim() || DEFAULT_SURVEY_FORM_URL;
  redirect(target);
}
