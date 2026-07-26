import Link from "next/link";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AdminPageHeader({ title, description, actionHref, actionLabel }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div>
        <h1 className="admin-page-title mb-1">{title}</h1>
        {description ? <p className="admin-page-desc mb-0">{description}</p> : null}
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn admin-btn-primary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

type AdminTableProps = {
  columns: string[];
  children: ReactNode;
};

export function AdminTable({ columns, children }: AdminTableProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return <p className="admin-empty mb-0">{message}</p>;
}

export function AdminBadge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "orange" | "gray" }) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}
