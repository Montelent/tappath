"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { localeLabels, locales, type Locale } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

export default function LanguageSwitcher({ className, compact }: Props) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] p-0.5 text-xs font-medium",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {locales.map((l: Locale) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-full px-2.5 py-1 transition",
            locale === l
              ? "bg-brand-600 text-white"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
          aria-pressed={locale === l}
        >
          {compact ? l.toUpperCase() : localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
