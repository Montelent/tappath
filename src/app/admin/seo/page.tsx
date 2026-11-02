import type { Metadata } from "next";
import SeoSettings from "@/components/admin/SeoSettings";

export const metadata: Metadata = {
  title: "Admin · SEO",
  robots: { index: false, follow: false },
};

export default function AdminSeoPage() {
  return <SeoSettings />;
}
