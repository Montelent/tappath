import type { Metadata } from "next";
import ForumModeration from "@/components/admin/ForumModeration";

export const metadata: Metadata = {
  title: "Admin · Forum",
  robots: { index: false, follow: false },
};

export default function AdminForumPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ForumModeration />
    </div>
  );
}
