"use client";

import { useMemo, useState } from "react";
import { icons, type LucideIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (name: string) => void;
};

const iconEntries = Object.entries(icons) as [string, LucideIcon][];

export default function IconPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[\s_-]+/g, "");
    const matches = q
      ? iconEntries.filter(([name]) => name.toLowerCase().replace(/[\s_-]+/g, "").includes(q))
      : iconEntries;
    return matches.slice(0, showAll ? 240 : 72);
  }, [query, showAll]);

  const selected = iconEntries.find(([name]) => name.toLowerCase() === value.trim().toLowerCase());
  const SelectedIcon = selected?.[1];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">SVG icon</span>
        {SelectedIcon ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2 py-1 text-xs">
            <SelectedIcon className="h-4 w-4" /> {selected?.[0]}
          </span>
        ) : (
          <span className="text-xs text-[var(--muted-foreground)]">Manual icon name: {value || "None"}</span>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter Lucide icon name (e.g. Wifi, Router, ShieldCheck)"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        aria-label="Lucide SVG icon name"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowAll(false); }}
        placeholder="Search all Lucide SVG icons…"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        aria-label="Search SVG icons"
      />
      <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-[var(--border)] p-2 sm:grid-cols-4 md:grid-cols-6">
        {filtered.map(([name, Icon]) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center text-[11px] hover:bg-[var(--muted)] ${value.toLowerCase() === name.toLowerCase() ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-transparent"}`}
          >
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate">{name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full p-4 text-center text-xs text-[var(--muted-foreground)]">No matching icons. You can still enter any icon name above.</p>
        )}
      </div>
      {!query && !showAll && iconEntries.length > filtered.length && (
        <button type="button" onClick={() => setShowAll(true)} className="text-xs font-medium text-brand-600 hover:underline">
          Show more icons ({iconEntries.length.toLocaleString()} available)
        </button>
      )}
      <p className="text-[11px] text-[var(--muted-foreground)]">Choose an icon to store its Lucide name, or type a name manually. Icons are rendered as inline SVGs.</p>
    </div>
  );
}
