"use client";

import { useEffect, useMemo, useState } from "react";
import { getSurveyOpenUrl, SURVEY_LABEL, DEFAULT_SURVEY_FORM_URL } from "@/lib/survey";

type SurveyFormModalProps = {
  embedUrl?: string;
  directUrl?: string;
  label?: string;
  variant?: "link" | "floating" | "banner";
  alwaysShow?: boolean;
};

export function useSurveyForm(embedUrl?: string, directUrl?: string, alwaysShow = false) {
  const targetUrl = useMemo(() => (embedUrl ?? directUrl ?? "").trim(), [embedUrl, directUrl]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const onOpen = () => {
    if (targetUrl) {
      setOpen(true);
      return;
    }
    if (alwaysShow) {
      window.open(DEFAULT_SURVEY_FORM_URL, "_blank", "noopener,noreferrer");
    }
  };

  return { targetUrl, open, setOpen, onOpen, canRender: Boolean(targetUrl || alwaysShow) };
}

export function SurveyModal({
  open,
  onClose,
  label,
  targetUrl,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  targetUrl: string;
}) {
  if (!open) return null;

  return (
    <div
      className="survey-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Survey form"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="survey-modal-frame">
        <div className="survey-modal-head">
          <p className="survey-modal-title mb-0">{label}</p>
          <button type="button" className="survey-modal-close" onClick={onClose} aria-label="Close survey">
            ✕
          </button>
        </div>
        <div className="survey-modal-body">
          <iframe src={targetUrl} title={label} className="survey-modal-iframe" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

function SurveyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function SurveyFormModal({
  embedUrl,
  directUrl,
  label = "Survey",
  variant = "link",
  alwaysShow = false,
}: SurveyFormModalProps) {
  const { targetUrl, open, setOpen, onOpen, canRender } = useSurveyForm(embedUrl, directUrl, alwaysShow);

  if (!canRender) return null;

  const openUrl = (
    getSurveyOpenUrl({
      label,
      embedUrl: embedUrl ?? "",
      directUrl: directUrl ?? "",
    }) ||
    directUrl ||
    embedUrl
  ).trim();

  const openInNewTab = () => {
    if (!openUrl) return;
    window.open(openUrl, "_blank", "noopener,noreferrer");
  };

  // Only the header "Survey" link uses the in-page modal.
  const modal =
    variant === "link" && targetUrl ? (
      <SurveyModal open={open} onClose={() => setOpen(false)} label={label} targetUrl={targetUrl} />
    ) : null;

  if (variant === "floating") {
    return (
      <>
        <a href={openUrl} target="_blank" rel="noopener noreferrer" className="enn-floating-survey">
          <span className="enn-floating-survey-icon" aria-hidden="true">
            <SurveyIcon />
          </span>
          <span className="enn-floating-survey-copy">
            <span className="enn-floating-survey-kicker">Survey</span>
            <span className="enn-floating-survey-title">{label}</span>
          </span>
        </a>
        {modal}
      </>
    );
  }

  if (variant === "banner") {
    return (
      <>
        <section className="home-survey-banner" aria-labelledby="home-survey-heading">
          <div className="home-survey-banner-inner">
            <div className="home-survey-banner-copy">
              <p className="home-survey-banner-kicker mb-1">Survey</p>
              <h2 id="home-survey-heading" className="home-survey-banner-title mb-2">
                {label}
              </h2>
              <p className="home-survey-banner-sub mb-0">
                Share your school&apos;s insights and participate in Education Today&apos;s 2026 survey programme.
              </p>
            </div>
            <a href={openUrl} target="_blank" rel="noopener noreferrer" className="home-survey-banner-btn">
              Take survey
            </a>
          </div>
        </section>
        {modal}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-link link-light link-underline-opacity-0 link-underline-opacity-100-hover px-0 py-0 survey-topbar-link"
        onClick={onOpen}
      >
        {label}
      </button>
      {modal}
    </>
  );
}

export { SURVEY_LABEL };
