import type { Metadata } from "next";
import MenusSettings from "@/components/admin/MenusSettings";

export const metadata: Metadata = {
  title: "Admin · Menus",
  robots: { index: false, follow: false },
};

export default function AdminMenusPage() {
  return <MenusSettings />;
}
