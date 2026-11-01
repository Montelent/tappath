import type { Metadata, Viewport } from "next";
import { DM_Sans, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import CustomCode from "@/components/CustomCode";
import AdSlot from "@/components/ads/AdSlot";
import CopilotWidget from "@/components/copilot/CopilotWidget";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/context/AuthContext";
import { getSiteSettings } from "@/lib/site-settings";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap" });

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.meta_title || `${s.site_name} — Phone settings, step by step`;
  const description = s.meta_description;
  const keywords = s.meta_keywords.split(",").map((k) => k.trim()).filter(Boolean);
  const ogImage = s.og_image_url || "/og.png";
  const icons = s.favicon_url
    ? { icon: [{ url: s.favicon_url }], shortcut: [s.favicon_url], apple: [{ url: s.favicon_url }] }
    : undefined;

  return {
    metadataBase: new URL(BASE),
    title: { default: title, template: `%s · ${s.site_name}` },
    description,
    keywords,
    authors: [{ name: s.author_name || s.site_name }],
    creator: s.site_name,
    icons,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: BASE,
      siteName: s.site_name,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: s.site_name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    robots: { index: true, follow: true },
    alternates: { canonical: BASE },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#161211" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sourceSerif.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <CustomCode slot="body_start" />
        <AuthProvider>
          <LanguageProvider>
            <OrganizationJsonLd />
            <CustomCode slot="head" />
            <MaintenanceBanner />
            <AdSlot placement="header" />
            <Header />
            <main id="main-content" className="flex-1 pb-24 md:pb-16 safe-pb">{children}</main>
            <AdSlot placement="before_footer" />
            <Footer />
            <CustomCode slot="footer" />
            <CopilotWidget />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
