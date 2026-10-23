"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Smartphone, ChevronRight } from "lucide-react";
import type { Device } from "@/data/devices";
import { brandFilters } from "@/data/devices";
import { cn } from "@/lib/utils";

type Props = {
  devices: Device[];
};

export default function DevicesDirectory({ devices }: Props) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");

  const filtered = useMemo(() => {
    let list = devices;
    if (brand !== "all") {
      list = list.filter((d) => d.brandSlug === brand);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.os.toLowerCase().includes(q) ||
          d.brand.toLowerCase().includes(q) ||
          (d.series && d.series.toLowerCase().includes(q))
      );
    }
    return list;
  }, [devices, brand, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">Devices</span>
      </nav>

      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Device directory
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          All smartphone models with guides and specs. Search by name, brand or OS version.
        </p>
      </header>

      <div className="mb-6 flex max-w-xl items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-sm">
        <Search className="ml-3 h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search devices (e.g. Galaxy S24, Pixel 9, HyperOS)..."
          className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {brandFilters.map((b) => (
          <button
            key={b.slug}
            onClick={() => setBrand(b.slug)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              brand === b.slug
                ? "bg-brand-600 text-white"
                : "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]"
            )}
          >
            {b.name}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        {filtered.length} device{filtered.length !== 1 ? "s" : ""}
        {brand !== "all" ? ` · ${brandFilters.find((b) => b.slug === brand)?.name}` : ""}
        {query ? ` · matching “${query}”` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--muted-foreground)]">
          No devices match your search. Try a different brand or keyword.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Link
              key={d.slug}
              href={d.href}
              className="group flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate">
                  {d.name}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">{d.os}</div>
                <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {d.brand}
                  {d.guides.length > 0 && ` · ${d.guides.length} guides`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
