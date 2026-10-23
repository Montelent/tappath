import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CopilotWidget from "@/components/copilot/CopilotWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TapPath",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
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
