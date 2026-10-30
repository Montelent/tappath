import type { Metadata } from "next";
import BulkExport from "@/components/admin/BulkExport";

export const metadata: Metadata = {
  title: "Admin · Export",
  robots: { index: false, follow: false },
};

export default function AdminExportPage() {
  return <BulkExport />;
}
