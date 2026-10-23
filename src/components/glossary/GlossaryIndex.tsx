"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import {
  glossaryTerms,
  glossaryCategories,
  alphabet,
  type GlossaryTerm,
} from "@/data/glossary";
import { cn } from "@/lib/utils";

export default function GlossaryIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    let list: GlossaryTerm[] = glossaryTerms;
    if (category !== "All") {
      list = list.filter((t) => t.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.short.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) =>
      a.term.localeCompare(b.term, undefined, { sensitivity: "base" })
    );
  }, [query, category]);

  const grouped = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    for (const t of filtered) {
      const letter = t.term.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return groups;
  }, [filtered]);

  const lettersPresent = Object.keys(grouped).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">Glossary</span>
      </nav>

      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          TechBone Glossary
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Smartphone & technology terms explained simply. {glossaryTerms.length} terms.
        </p>
      </header>

      <div className="mb-6 flex max-w-xl items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-sm">
        <Search className="ml-3 h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms (e.g. VoLTE, eSIM, AMOLED)..."
          className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {glossaryCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              category === c
                ? "bg-brand-600 text-white"
                : "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-1">
        {alphabet.map((letter) => {
          const has = lettersPresent.includes(letter);
          return has ? (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950"
            >
              {letter}
            </a>
          ) : (
            <span
              key={letter}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-[var(--muted-foreground)]/40"
            >
              {letter}
            </span>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        {filtered.length} term{filtered.length !== 1 ? "s" : ""}
        {category !== "All" ? ` · ${category}` : ""}
        {query ? ` · matching “${query}”` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--muted-foreground)]">
          No terms match your search.
        </div>
      ) : (
        <div className="space-y-10">
          {lettersPresent.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-brand-600 dark:text-brand-400">
                {letter}
              </h2>
              <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                {grouped[letter].map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/glossary/${t.slug}`}
                      className="flex flex-col gap-0.5 px-4 py-3.5 transition hover:bg-[var(--muted)]/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold">{t.term}</div>
                        <div className="text-sm text-[var(--muted-foreground)] line-clamp-1">
                          {t.short}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                        {t.category}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
