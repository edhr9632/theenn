import type { AdminWeeklyIssue } from "@/lib/weeklyAdmin";

export function getWeeklyViewerPath(slug: string) {
  return `/weekly-news/${slug}`;
}

export function getWeeklyDownloadName(issue: Pick<AdminWeeklyIssue, "slug" | "dateLabel" | "cityName" | "title">) {
  const city = (issue.cityName || "edition").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `education-today-weekly-${city}-${issue.slug}.pdf`;
}

export async function downloadWeeklyPdf(pdfUrl: string, filename: string) {
  if (typeof window === "undefined") return;

  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }
}
