import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CopilotWidget from "@/components/copilot/CopilotWidget";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "TapPath | Interactive smartphone settings guides",
    template: "%s | TapPath",
  },
  description:
    "3,100+ interactive guides for Samsung, Xiaomi, Huawei, OnePlus, Oppo, Realme and more. Visual step-by-step paths — verified, versioned, no hallucinations.",
  keywords: [
    "smartphone settings",
    "Android guides",
    "Samsung One UI",
    "Xiaomi HyperOS",
    "step by step",
    "menu path",
    "how to",
  ],
  authors: [{ name: "TapPath" }],
  creator: "TapPath",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TapPath",
    title: "TapPath | Interactive smartphone settings guides",
    description:
      "Visual step-by-step smartphone settings guides with interactive Live Simulator.",
    url: BASE,
  },
  twitter: {
    card: "summary_large_image",
    title: "TapPath | Interactive smartphone settings guides",
    description:
      "Visual step-by-step smartphone settings guides with interactive Live Simulator.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <OrganizationJsonLd />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CopilotWidget />
      </body>
    </html>
  );
}
