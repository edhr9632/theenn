"use client";

import SurveyFormModal from "./SurveyFormModal";
import { getSurveyConfig } from "@/lib/survey";

export default function HomeSurveyBanner() {
  const config = getSurveyConfig();

  return (
    <SurveyFormModal
      variant="banner"
      embedUrl={config.embedUrl}
      directUrl={config.directUrl}
      label={config.label}
    />
  );
}
