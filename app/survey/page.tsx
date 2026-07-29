import { redirect } from "next/navigation";
import { SURVEY_ROUTE_PATH } from "@/lib/survey";

export const dynamic = "force-dynamic";

/** /survey → branded path that redirects to Google Form */
export default function SurveyIndexPage() {
  redirect(SURVEY_ROUTE_PATH);
}
