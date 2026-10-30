import type { Metadata } from "next";
import I18nEditor from "@/components/admin/I18nEditor";

export const metadata: Metadata = {
  title: "Admin · i18n",
  robots: { index: false, follow: false },
};

export default function AdminI18nPage() {
  return <I18nEditor />;
}
