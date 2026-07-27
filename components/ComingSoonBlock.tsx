type ComingSoonBlockProps = {
  title?: string;
  message?: string;
  compact?: boolean;
  className?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function ComingSoonBlock({
  title = "Coming soon",
  message = "Content for this section will appear here once it is added in the admin panel.",
  compact = false,
  className = "",
  ctaLabel,
  ctaHref,
}: ComingSoonBlockProps) {
  return (
    <div
      className={`coming-soon-block${compact ? " coming-soon-block--compact" : ""}${className ? ` ${className}` : ""}`}
      role="status"
    >
      <div className="coming-soon-block-inner">
        <span className="coming-soon-block-badge">Coming soon</span>
        <p className="coming-soon-block-title mb-1">{title}</p>
        <p className="coming-soon-block-message mb-0">{message}</p>
        {ctaLabel && ctaHref ? (
          <div className="coming-soon-cta mt-3">
            <a className="btn btn-primary fw-semibold" href={ctaHref} target="_blank" rel="noopener noreferrer">
              {ctaLabel}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
