"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import CustomCode from "@/components/CustomCode";
import AdSlot from "@/components/ads/AdSlot";
import CopilotWidget from "@/components/copilot/CopilotWidget";

/**
 * Public site chrome only. Admin routes render children alone so the
 * WordPress-style backend never shows the public header/nav/footer.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <CustomCode slot="head" />
      <MaintenanceBanner />
      <AdSlot placement="header" />
      <Header />
      <main id="main-content" className="flex-1 pb-24 md:pb-16 safe-pb">
        {children}
      </main>
      <AdSlot placement="before_footer" />
      <Footer />
      <CustomCode slot="footer" />
      <CopilotWidget />
    </>
  );
}
