import type { Metadata } from "next";
import UsersAdmin from "@/components/admin/UsersAdmin";

export const metadata: Metadata = {
  title: "Admin · Users",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UsersAdmin />
    </div>
  );
}
