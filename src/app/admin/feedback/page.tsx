import type { Metadata } from "next";
import FeedbackInbox from "@/components/admin/FeedbackInbox";

export const metadata: Metadata = {
  title: "Admin · Feedback",
  robots: { index: false, follow: false },
};

export default function AdminFeedbackPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <FeedbackInbox />
    </div>
  );
}
