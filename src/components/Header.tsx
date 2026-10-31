"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useAuthOptional } from "@/context/AuthContext";
import type { SiteSettings } from "@/lib/site-settings";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [s, setS] = useState({
    site_name: SITE_SETTINGS_DEFAULTS.site_name,
    logo_url: "",
    nav_home: SITE_SETTINGS_DEFAULTS.nav_home,
    nav_topics: SITE_SETTINGS_DEFAULTS.nav_topics,
    nav_devices: SITE_SETTINGS_DEFAULTS.nav_devices,
    nav_glossary: SITE_SETTINGS_DEFAULTS.nav_glossary,
    nav_forum: SITE_SETTINGS_DEFAULTS.nav_forum,
    nav_admin: SITE_SETTINGS_DEFAULTS.nav_admin,
    nav_sign_in: SITE_SETTINGS_DEFAULTS.nav_sign_in,
  });
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
        const raw = (data.settings || {}) as Partial<SiteSettings>;
        setS((prev) => ({
          site_name: raw.site_name || prev.site_name,
          logo_url: typeof raw.logo_url === "string" ? raw.logo_url : prev.logo_url,
          nav_home: raw.nav_home || prev.nav_home,
          nav_topics: raw.nav_topics || prev.nav_topics,
          nav_devices: raw.nav_devices || prev.nav_devices,
          nav_glossary: raw.nav_glossary || prev.nav_glossary,
          nav_forum: raw.nav_forum || prev.nav_forum,
          nav_admin: raw.nav_admin || prev.nav_admin,
          nav_sign_in: raw.nav_sign_in || prev.nav_sign_in,
        }));
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
    { href: "/", label: s.nav_home },
    { href: "/topics", label: s.nav_topics },
    { href: "/devices", label: s.nav_devices },
    { href: "/glossary", label: s.nav_glossary },
    { href: "/forum", label: s.nav_forum },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="max-wide page-pad flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg tracking-tight link-quiet shrink-0 flex items-center gap-2"
        >
          {s.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.logo_url}
              alt={s.site_name}
              className="h-7 w-auto max-w-[140px] object-contain"
            />
          ) : (
            s.site_name
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
              {s.nav_admin}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="hidden sm:inline text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] link-quiet"
            >
              {s.nav_sign_in}
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
            {auth?.user ? s.nav_admin : s.nav_sign_in}
          </Link>
        </nav>
      )}
    </header>
  );
}
