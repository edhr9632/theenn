export type WeeklyIssue = {
  slug: string;
  dateLabel: string;
  weekday: string;
  title: string;
  tagline: string;
  coverImage: string;
  pdfUrl: string;
  highlights: { label: string; tone: "red" | "blue" | "purple" | "teal" | "ink" }[];
  featured?: boolean;
};

/** Weekly editions are managed in admin/localStorage — no static seed issues. */
export const weeklyIssues: WeeklyIssue[] = [];
