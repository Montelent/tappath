"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/i18n/LanguageProvider";
import { useAuthOptional } from "@/context/AuthContext";
import type { SiteSettings } from "@/lib/site-settings";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteName, setSiteName] = useState("TapPath");
  const [logoUrl, setLogoUrl] = useState("");
  const t = useT();
  const auth = useAuthOptional();

  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const s = (data.settings || {}) as Partial<SiteSettings>;
        if (s.site_name) setSiteName(s.site_name);
        if (typeof s.logo_url === "string") setLogoUrl(s.logo_url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const nav = [
    { href: "/", label: t.common.home },
    { href: "/topics", label: t.nav.topics },
    { href: "/devices", label: t.nav.devices },
    { href: "/glossary", label: t.nav.glossary },
    { href: "/forum", label: "Forum" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="max-wide page-pad flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg tracking-tight link-quiet shrink-0 flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-7 w-auto max-w-[140px] object-contain" />
          ) : (
            siteName
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] link-quiet transition-colors duration-fast"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleDark}
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-fast"
            aria-label={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {auth?.user ? (
            <Link
              href="/admin"
              className="hidden sm:inline text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] link-quiet"
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="hidden sm:inline text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] link-quiet"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            className="md:hidden p-2 text-[var(--muted-foreground)]"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="md:hidden border-t border-[var(--border)] page-pad py-3 flex flex-col gap-1"
          aria-label="Mobile"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm link-quiet"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={auth?.user ? "/admin" : "/sign-in"}
            onClick={() => setMobileOpen(false)}
            className="py-2.5 text-sm link-quiet text-[var(--muted-foreground)]"
          >
            {auth?.user ? "Admin" : "Sign in"}
          </Link>
        </nav>
      )}
    </header>
  );
}
