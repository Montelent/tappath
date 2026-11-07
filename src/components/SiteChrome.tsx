"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import CopilotWidget from "@/components/copilot/CopilotWidget";

type Props = {
  children: ReactNode;
  headCode?: ReactNode;
  maintenanceBanner?: ReactNode;
  headerAd?: ReactNode;
  beforeFooterAd?: ReactNode;
  footer?: ReactNode;
  footerCode?: ReactNode;
};

/**
 * Public site chrome. Server-rendered slots are supplied by the root layout,
 * keeping async data components out of this client-side route switcher.
 */
export default function SiteChrome({
  children,
  headCode,
  maintenanceBanner,
  headerAd,
  beforeFooterAd,
  footer,
  footerCode,
}: Props) {
  const pathname = usePathname() || "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {headCode}
      {maintenanceBanner}
      {headerAd}
      <Header />
      <main id="main-content" className="flex-1 pb-24 md:pb-16 safe-pb">
        {children}
      </main>
      {beforeFooterAd}
      {footer}
      {footerCode}
      <CopilotWidget />
    </>
  );
}
