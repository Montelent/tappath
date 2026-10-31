import type { Metadata, Viewport } from "next";
import { DM_Sans, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CopilotWidget from "@/components/copilot/CopilotWidget";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/context/AuthContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
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

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "TapPath — Phone settings, step by step",
    template: "%s · TapPath",
  },
  description:
    "Exact menu paths for Samsung, Xiaomi, Huawei, OnePlus, Oppo, Realme, Android and Google phones. Verified screenshots and steps.",
  keywords: [
    "smartphone settings",
    "Android how to",
    "Samsung One UI",
    "Xiaomi HyperOS",
    "menu path",
  ],
  authors: [{ name: "TapPath" }],
  creator: "TapPath",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE,
    siteName: "TapPath",
    title: "TapPath — Phone settings, step by step",
    description:
      "Exact menu paths for major Android phones. Verified screenshots and steps.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "TapPath" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TapPath — Phone settings, step by step",
    description:
      "Exact menu paths for major Android phones. Verified screenshots and steps.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: BASE },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1916" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${sourceSerif.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <LanguageProvider>
            <OrganizationJsonLd />
            <Header />
            <main className="flex-1 pb-24 md:pb-16">{children}</main>
            <Footer />
            <CopilotWidget />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
