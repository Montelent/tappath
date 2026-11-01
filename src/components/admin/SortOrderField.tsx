"use client";

type Props = {
  value: number;
  onChange: (n: number) => void;
  autoValue: number;
  label?: string;
  help?: string;
};

export default function SortOrderField({
  value,
  onChange,
  autoValue,
  label = "Sort order",
  help = "Lower numbers appear first. Use Auto for the next free slot, or type a number to place it exactly.",
}: Props) {
  const n = Number.isFinite(value) ? value : 0;
  const isAutoLike = n === autoValue || n === 0;

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
        {label}
      </span>
      {help && (
        <p className="mb-2 text-[11px] text-[var(--muted-foreground)]">{help}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          step={1}
          value={n}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-28 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm tabular-nums"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => onChange(autoValue)}
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
          title={`Set to ${autoValue}`}
        >
          Auto → {autoValue}
        </button>
        {isAutoLike && (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Using next available
          </span>
        )}
      </div>
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
