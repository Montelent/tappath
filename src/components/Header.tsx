"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/i18n/LanguageProvider";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useT();

  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <span className="text-sm font-bold">TP</span>
          </div>
          <span className="text-lg">
            Tap<span className="text-brand-600 dark:text-brand-400">Path</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          >
            {t.common.home}
          </Link>
          <Link
            href="/topics"
            className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          >
            {t.nav.topics}
          </Link>
          <Link
            href="/devices"
            className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          >
            {t.nav.devices}
          </Link>
          <Link
            href="/glossary"
            className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          >
            {t.nav.glossary}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="hidden rounded-full p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)] sm:inline-flex"
            aria-label={t.common.search}
          >
            <Search className="h-5 w-5" />
          </button>

          <LanguageSwitcher compact className="hidden sm:inline-flex" />

          <button
            onClick={toggleDark}
            className="rounded-full p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link
            href="/sign-in"
            className="ml-1 hidden rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 sm:inline-flex"
          >
            {t.nav.signIn}
          </Link>

          <button
            className="inline-flex rounded-full p-2 text-[var(--muted-foreground)] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-[var(--border)] bg-[var(--background)] md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            onClick={() => setMobileOpen(false)}
          >
            {t.common.home}
          </Link>
          <Link
            href="/topics"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            onClick={() => setMobileOpen(false)}
          >
            {t.nav.topics}
          </Link>
          <Link
            href="/devices"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            onClick={() => setMobileOpen(false)}
          >
            {t.nav.devices}
          </Link>
          <Link
            href="/glossary"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            onClick={() => setMobileOpen(false)}
          >
            {t.nav.glossary}
          </Link>
          <div className="mt-2 flex items-center justify-between px-3 py-2">
            <span className="text-sm text-[var(--muted-foreground)]">Language</span>
            <LanguageSwitcher compact />
          </div>
          <Link
            href="/sign-in"
            className="mt-2 rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white"
            onClick={() => setMobileOpen(false)}
          >
            {t.nav.signIn}
          </Link>
        </nav>
      </div>
    </header>
  );
}
