import type { Metadata } from "next";
import SiteSettings from "@/components/admin/SiteSettings";

export const metadata: Metadata = {
  title: "Admin · Site settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SiteSettings />;
}
