import type { Metadata } from "next";
import AuthorSettings from "@/components/admin/AuthorSettings";

export const metadata: Metadata = {
  title: "Admin · Author",
  robots: { index: false, follow: false },
};

export default function AdminAuthorPage() {
  return <AuthorSettings />;
}
