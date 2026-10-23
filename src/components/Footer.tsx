"use client";

import Link from "next/link";
import { useT } from "@/i18n/LanguageProvider";

const brands = [
  { name: "Samsung", href: "/samsung" },
  { name: "Xiaomi", href: "/xiaomi" },
  { name: "Huawei", href: "/huawei" },
  { name: "OnePlus", href: "/oneplus" },
  { name: "Oppo", href: "/oppo" },
  { name: "Realme", href: "/realme" },
  { name: "Google", href: "/google" },
  { name: "Android", href: "/android" },
];

const topicLinks = [
  { name: "Network & Connectivity", href: "/topics/network" },
  { name: "Display & Home Screen", href: "/topics/display" },
  { name: "Battery & Power", href: "/topics/battery" },
  { name: "Security & Privacy", href: "/topics/security" },
  { name: "Notifications & Focus", href: "/topics/notifications" },
  { name: "Calls & Messages", href: "/topics/messaging" },
];

export default function Footer() {
  const t = useT();
  const explore = [
    { name: t.nav.devices, href: "/devices" },
    { name: t.nav.glossary, href: "/glossary" },
    { name: "Forum", href: "/forum" },
  ];
  const legal = [
    { name: t.footer.privacy, href: "/privacy" },
    { name: t.footer.terms, href: "/terms" },
  ];

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)]/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <span className="text-sm font-bold">TP</span>
              </div>
              <span>
                Tap<span className="text-brand-600 dark:text-brand-400">Path</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t.footer.tagline}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t.footer.brands}</h3>
            <ul className="mt-3 space-y-2">
              {brands.map((b) => (
                <li key={b.href}>
                  <Link href={b.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{b.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t.footer.topics}</h3>
            <ul className="mt-3 space-y-2">
              {topicLinks.map((x) => (
                <li key={x.href}>
                  <Link href={x.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{x.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t.footer.explore}</h3>
            <ul className="mt-3 space-y-2">
              {explore.map((x) => (
                <li key={x.href}>
                  <Link href={x.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{x.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t.footer.legal}</h3>
            <ul className="mt-3 space-y-2">
              {legal.map((x) => (
                <li key={x.href}>
                  <Link href={x.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{x.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} TapPath
        </div>
      </div>
    </footer>
  );
}
