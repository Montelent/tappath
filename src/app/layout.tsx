import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Newsreader, IBM_Plex_Mono } from "next/font/google";
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

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

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

  const sep = (s.seo_title_separator || "·").trim() || "·";
  const verification: Metadata["verification"] = {};
  if (s.seo_google_verification) verification.google = s.seo_google_verification;
  if (s.seo_yandex_verification) verification.yandex = s.seo_yandex_verification;

  const other: Record<string, string | number | (string | number)[]> = {};
  if (s.seo_bing_verification) other["msvalidate.01"] = s.seo_bing_verification;
  if (s.seo_pinterest_verification) other["p:domain_verify"] = s.seo_pinterest_verification;

  return {
    metadataBase: new URL(BASE),
    title: { default: title, template: `%s ${sep} ${s.site_name}` },
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
    robots: {
      index: s.seo_robots_index !== false,
      follow: s.seo_robots_follow !== false,
    },
    verification: Object.keys(verification).length ? verification : undefined,
    other: Object.keys(other).length ? other : undefined,
    alternates: { canonical: BASE },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f1ec" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1614" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${newsreader.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
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
