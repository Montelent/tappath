import type { Metadata } from "next";
import GuideEditor from "@/components/admin/GuideEditor";

export const metadata: Metadata = {
  title: "Admin · Guides",
  robots: { index: false, follow: false },
};

export default function AdminGuidesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <GuideEditor />
    </div>
  );
}
