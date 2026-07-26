import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { buildPageMetadata } from "@/lib/seo";
import "../admin.css";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Admin",
    description: "Education News Network admin console.",
    path: "/admin",
    noIndex: true,
  }),
  title: {
    default: "Admin",
    template: "%s | ENN Admin",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
