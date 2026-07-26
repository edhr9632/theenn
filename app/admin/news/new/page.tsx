import { redirect } from "next/navigation";

export default function LegacyNewsNewRedirect() {
  redirect("/admin/news/daily/new");
}
