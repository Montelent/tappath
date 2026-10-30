"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  meta?: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string, option?: SelectOption) => void;
  placeholder?: string;
  allowCustom?: boolean;
  help?: string;
};

export default function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Search or select…",
  allowCustom = true,
  help,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value || o.label === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.meta || "").toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
        className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm"
      >
        <span className={selected || value ? "" : "text-[var(--muted-foreground)]"}>
          {selected?.label || value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
      </button>
      {help && <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{help}</p>}

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-[var(--muted)]"
                  onClick={() => {
                    onChange(o.value, o);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="font-medium">{o.label}</span>
                  {o.meta && (
                    <span className="text-[11px] text-[var(--muted-foreground)]">{o.meta}</span>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && allowCustom && query.trim() && (
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-brand-600 hover:bg-[var(--muted)]"
                  onClick={() => {
                    onChange(query.trim());
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  Use “{query.trim()}”
                </button>
              </li>
            )}
            {filtered.length === 0 && !allowCustom && (
              <li className="px-3 py-2 text-sm text-[var(--muted-foreground)]">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
