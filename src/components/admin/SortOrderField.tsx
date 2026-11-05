"use client";

import { useState } from "react";

type Props = {
  value: number;
  onChange: (n: number) => void;
  autoValue: number;
  defaultMode?: "auto" | "manual";
  label?: string;
  help?: string;
};

export default function SortOrderField({
  value,
  onChange,
  autoValue,
  defaultMode = "manual",
  label = "Sort order",
  help = "Choose automatic placement or set an exact manual position. Lower numbers appear first.",
}: Props) {
  const [mode, setMode] = useState<"auto" | "manual">(defaultMode);
  const n = Number.isFinite(value) ? value : 0;

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      {help && <p className="mb-2 text-[11px] text-[var(--muted-foreground)]">{help}</p>}
      <div className="mb-2 inline-flex rounded-xl border border-[var(--border)] p-1">
        <button
          type="button"
          onClick={() => { setMode("auto"); onChange(autoValue); }}
          aria-pressed={mode === "auto"}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "auto" ? "bg-brand-600 text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}
        >
          Auto
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          aria-pressed={mode === "manual"}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "manual" ? "bg-brand-600 text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}
        >
          Manual
        </button>
      </div>
      {mode === "auto" ? (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">Automatically placed at position {autoValue}. New items follow the current highest sort position.</p>
      ) : (
        <input
          type="number"
          min={0}
          step={1}
          value={n}
          onChange={(e) => { setMode("manual"); onChange(Number(e.target.value) || 0); }}
          className="block w-32 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm tabular-nums"
          aria-label={label}
        />
      )}
    </div>
  );
}

export function nextSortOrder(
  rows: { sort_order?: unknown }[],
  excludeId?: string
): number {
  let max = 0;
  for (const r of rows) {
    if (excludeId && String((r as { id?: unknown }).id) === excludeId) continue;
    const v = Number(r.sort_order);
    if (Number.isFinite(v) && v > max) max = v;
  }
  return max + 1;
}
