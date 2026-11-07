import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import CustomCode from "@/components/CustomCode";
import SiteChrome from "@/components/SiteChrome";
import Footer from "@/components/Footer";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import AdSlot from "@/components/ads/AdSlot";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { getSiteSettings } from "@/lib/site-settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

/** Resolve site origin from settings / env / live request — never hardcode a domain. */
async function resolveSiteOrigin(canonicalHost?: string): Promise<string> {
  const candidates = [
    (canonicalHost || "").trim(),
    (process.env.NEXT_PUBLIC_SITE_URL || "").trim(),
    (process.env.VERCEL_URL || "").trim()
      ? `https://${(process.env.VERCEL_URL || "").trim().replace(/^https?:\\/\\//, "")}`
      : "",
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      const u = new URL(c.startsWith("http") ? c : `https://${c}`);
      return u.origin;
    } catch {
      /* try next */
    }
  }
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") || "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    /* no request context */
  }
  return "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const origin = await resolveSiteOrigin(s.seo_canonical_host);
  const title = s.meta_title || `${s.site_name} — Phone settings, step by step`;
  const description = s.meta_description;
  const keywords = s.meta_keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const ogImage = s.og_image_url || "/og.png";
  const icons = s.favicon_url
    ? {
        icon: [{ url: s.favicon_url }],
        shortcut: [s.favicon_url],
        apple: [{ url: s.favicon_url }],
      }
    : undefined;

  const sep = (s.seo_title_separator || "·").trim() || "·";
  const verification: Metadata["verification"] = {};
  if (s.seo_google_verification) verification.google = s.seo_google_verification;
  if (s.seo_yandex_verification) verification.yandex = s.seo_yandex_verification;

  const other: Record<string, string | number | (string | number)[]> = {};
  if (s.seo_bing_verification) other["msvalidate.01"] = s.seo_bing_verification;
  if (s.seo_pinterest_verification) other["p:domain_verify"] = s.seo_pinterest_verification;

  return {
    metadataBase: new URL(origin),
    title: {
      default: title,
      template: `%s ${sep} ${s.site_name}`,
    },
    description,
    keywords,
    authors: [{ name: s.site_name }],
    creator: s.site_name,
    icons,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: origin,
      siteName: s.site_name,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: s.site_name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: s.seo_robots_index !== false,
      follow: s.seo_robots_follow !== false,
    },
    verification: Object.keys(verification).length ? verification : undefined,
    other: Object.keys(other).length ? other : undefined,
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f14" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <CustomCode slot="body_start" />
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <OrganizationJsonLd />
              <SiteChrome
                headCode={<CustomCode slot="head" />}
                maintenanceBanner={<MaintenanceBanner />}
                headerAd={<AdSlot placement="header" />}
                beforeFooterAd={<AdSlot placement="before_footer" />}
                footer={<Footer />}
                footerCode={<CustomCode slot="footer" />}
              >
                {children}
              </SiteChrome>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
