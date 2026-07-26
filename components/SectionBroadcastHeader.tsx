import Link from "next/link";
import type { ReactNode } from "react";

type SectionBroadcastHeaderProps = {
  id?: string;
  title: string;
  href?: string;
  action?: ReactNode;
  className?: string;
};

export default function SectionBroadcastHeader({
  id,
  title,
  href,
  action,
  className = "",
}: SectionBroadcastHeaderProps) {
  const titleContent = (
    <h2 id={id} className="section-broadcast-title serif-headline mb-0">
      {title}
    </h2>
  );

  return (
    <header className={`section-broadcast-header ${className}`.trim()}>
      <div className="section-broadcast-main min-w-0">
        {href ? (
          <Link href={href} className="section-broadcast-title-link text-decoration-none">
            {titleContent}
          </Link>
        ) : (
          titleContent
        )}
      </div>
      {action ? <div className="section-broadcast-action flex-shrink-0">{action}</div> : null}
    </header>
  );
}
