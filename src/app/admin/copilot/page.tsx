import type { Metadata } from "next";
import CopilotSettings from "@/components/admin/CopilotSettings";

export const metadata: Metadata = {
  title: "Admin · Copilot",
  robots: { index: false, follow: false },
};

export default function AdminCopilotPage() {
  return <CopilotSettings />;
}
