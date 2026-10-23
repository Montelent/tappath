"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultLocale,
  getDictionary,
  type Locale,
  locales,
} from "./dictionaries";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getDictionary>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "tappath-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && locales.includes(stored)) {
        setLocaleState(stored);
      } else {
        const nav = navigator.language?.slice(0, 2).toLowerCase();
        if (nav === "de") setLocaleState("de");
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    if (locales.includes(next)) setLocaleState(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: getDictionary(locale),
    }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function useT() {
  const ctx = useContext(LanguageContext);
  return ctx?.t ?? getDictionary("en");
}
