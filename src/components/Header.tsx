"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useAuthOptional } from "@/context/AuthContext";
import type { NavMenuItem, SiteSettings } from "@/lib/site-settings";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
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
    nav_items: [] as NavMenuItem[],
  });
  const auth = useAuthOptional();

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
          nav_items: Array.isArray(raw.nav_items) ? raw.nav_items : prev.nav_items,
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const nav: NavMenuItem[] =
    Array.isArray(s.nav_items) && s.nav_items.length > 0
      ? s.nav_items
      : [
          { id: "home", href: "/", label: s.nav_home },
          { id: "topics", href: "/topics", label: s.nav_topics },
          { id: "devices", href: "/devices", label: s.nav_devices },
          { id: "glossary", href: "/glossary", label: s.nav_glossary },
          { id: "forum", href: "/forum", label: s.nav_forum },
        ];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="flex items-center gap-2 shrink-0 link-quiet">
          {s.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--accent-foreground)]">
              {(s.site_name || "T").charAt(0)}
            </span>
          )}
          <span className="text-[15px] font-semibold tracking-tight">{s.site_name}</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 md:flex" aria-label="Main">
          {nav.map((item) => (
            item.children?.length ? (
              <div key={item.id} className="relative">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
                    {item.label}<span aria-hidden="true" className="text-[10px]">▾</span>
                  </summary>
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-48 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-xl">
                    {item.children.map((child) => (
                      <Link key={child.id} href={child.href} {...(child.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">{child.label}</Link>
                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <Link key={item.id} href={item.href} {...(item.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] link-quiet hover:bg-[var(--muted)] hover:text-[var(--foreground)]">{item.label}</Link>
            )
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={theme === "dark"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {auth?.isAdmin ? (
            <Link
              href="/admin"
              className="hidden sm:inline-flex rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            >
              {s.nav_admin}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            >
              {s.nav_sign_in}
            </Link>
          )}
          <button
            type="button"
            className="md:hidden rounded-full p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg md:hidden"
        >
          <nav className="flex flex-col gap-0.5 p-2" aria-label="Mobile">
            {nav.map((item) => (
              <div key={item.id}>
                <Link href={item.href} onClick={() => setMobileOpen(false)} {...(item.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block rounded-xl px-3 py-3 text-base font-medium link-quiet hover:bg-[var(--muted)]">{item.label}</Link>
                {item.children?.length ? <div className="ml-4 border-l border-[var(--border)] pl-2">{item.children.map((child) => <Link key={child.id} href={child.href} onClick={() => setMobileOpen(false)} {...(child.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]">{child.label}</Link>)}</div> : null}
              </div>
            ))}
            <div className="my-1 border-t border-[var(--border)]" />
            {auth?.user ? (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-semibold text-[var(--accent)]"
              >
                {s.nav_admin}
              </Link>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-semibold text-[var(--accent)]"
              >
                {s.nav_sign_in}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
