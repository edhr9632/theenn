"use client";

import { usePathname } from "next/navigation";
import SurveyFormModal from "./SurveyFormModal";
import { getSurveyConfig } from "@/lib/survey";

export default function FloatingSurvey() {
  const pathname = usePathname();
  const config = getSurveyConfig();

  if (pathname !== "/") return null;

  return (
    <SurveyFormModal
      variant="floating"
      embedUrl={config.embedUrl}
      directUrl={config.directUrl}
      label={config.label}
      alwaysShow
    />
  );
}
