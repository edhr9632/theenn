"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { readWeeklyIssues, type AdminWeeklyIssue } from "@/lib/weeklyAdmin";
import { downloadWeeklyPdf, getWeeklyDownloadName } from "@/lib/weeklyIssueUtils";

type WeeklyIssueViewerProps = {
  slug: string;
};

export default function WeeklyIssueViewer({ slug }: WeeklyIssueViewerProps) {
  const [issue, setIssue] = useState<AdminWeeklyIssue | null>(null);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loaded = readWeeklyIssues();
    const found = loaded.find((item) => item.slug === slug) ?? null;
    setIssue(found);
    setReady(true);
  }, [slug]);

  useEffect(() => {
    document.body.classList.add("weekly-pdf-open");
    return () => document.body.classList.remove("weekly-pdf-open");
  }, []);

  const downloadName = useMemo(() => (issue ? getWeeklyDownloadName(issue) : "weekly-edition.pdf"), [issue]);

  const onDownload = useCallback(async () => {
    if (!issue || downloading) return;
    setDownloading(true);
    try {
      await downloadWeeklyPdf(issue.pdfUrl, downloadName);
    } finally {
      setDownloading(false);
    }
  }, [issue, downloadName, downloading]);

  if (!ready) {
    return (
      <div className="weekly-pdf-fullscreen">
        <p className="weekly-pdf-loading">Loading newspaper…</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="weekly-pdf-fullscreen weekly-pdf-fullscreen--empty">
        <div className="weekly-pdf-empty-card">
          <h1 className="serif-headline h4 mb-3">Weekly edition not found</h1>
          <p className="text-secondary mb-4">This PDF may have been removed or the link is incorrect.</p>
          <Link href="/weekly-news" className="weekly-btn weekly-btn-primary">
            Back to Weekly News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-pdf-fullscreen" aria-label={`${issue.title} — ${issue.dateLabel}`}>
      <div className="weekly-pdf-floatbar">
        <Link href="/weekly-news" className="weekly-pdf-floatbar-btn weekly-pdf-floatbar-btn--back">
          ← Back
        </Link>
        <span className="weekly-pdf-floatbar-title">
          {issue.title} · {issue.dateLabel}
        </span>
        <button
          type="button"
          className="weekly-pdf-floatbar-btn weekly-pdf-floatbar-btn--download"
          onClick={onDownload}
          disabled={downloading}
        >
          {downloading ? "Downloading…" : "Download PDF"}
        </button>
      </div>

      <iframe
        title={`${issue.title} — ${issue.dateLabel}`}
        src={`${issue.pdfUrl}#view=FitH&toolbar=1`}
        className="weekly-pdf-fullframe"
      />
    </div>
  );
}
