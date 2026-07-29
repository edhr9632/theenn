export const SURVEY_LABEL = "Dynamic School - South India Educators' Summit Survey and Nomination Form 2026";
export const SURVEY_SLUG = "dynamic-school-south-india-educators-summit-survey-and-nomination-form-2026";
export const SURVEY_ROUTE_PATH = `/survey/${SURVEY_SLUG}`;

/** Dynamic School — South India Educators' Summit Survey and Nomination Form 2026 */
export const DEFAULT_SURVEY_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeCAFKPD7ccmrSoKG2UFGtmYIdrSNPqBrrNx5PaTi_TizAKUA/viewform";

export const DEFAULT_SURVEY_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeCAFKPD7ccmrSoKG2UFGtmYIdrSNPqBrrNx5PaTi_TizAKUA/viewform?embedded=true";

export type SiteSurveyConfig = {
  label: string;
  embedUrl: string;
  directUrl: string;
};

export function getSurveyConfig(): SiteSurveyConfig {
  return {
    label: SURVEY_LABEL,
    embedUrl: process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL?.trim() || DEFAULT_SURVEY_FORM_EMBED_URL,
    directUrl: process.env.NEXT_PUBLIC_GOOGLE_FORM_URL?.trim() || DEFAULT_SURVEY_FORM_URL,
  };
}

/** URL for opening the form in a new browser tab (Google Form — always works on live). */
export function getSurveyOpenUrl(config: SiteSurveyConfig = getSurveyConfig()) {
  return config.directUrl?.trim() || config.embedUrl?.trim() || DEFAULT_SURVEY_FORM_URL;
}

/** URL for embedding the form in the header modal iframe */
export function getSurveyEmbedUrl(config: SiteSurveyConfig = getSurveyConfig()) {
  return config.embedUrl || config.directUrl;
}

export function hasSurveyTarget(config: SiteSurveyConfig = getSurveyConfig()) {
  return Boolean(getSurveyOpenUrl(config));
}
