"use client";

const PRESETS: { name: string; hex: string; legacy?: string }[] = [
  { name: "Blue", hex: "#3b82f6", legacy: "bg-blue-500" },
  { name: "Indigo", hex: "#6366f1", legacy: "bg-indigo-500" },
  { name: "Violet", hex: "#8b5cf6", legacy: "bg-violet-500" },
  { name: "Purple", hex: "#a855f7", legacy: "bg-purple-500" },
  { name: "Pink", hex: "#ec4899", legacy: "bg-pink-500" },
  { name: "Rose", hex: "#f43f5e", legacy: "bg-rose-500" },
  { name: "Red", hex: "#ef4444", legacy: "bg-red-500" },
  { name: "Orange", hex: "#f97316", legacy: "bg-orange-500" },
  { name: "Amber", hex: "#f59e0b", legacy: "bg-amber-500" },
  { name: "Yellow", hex: "#eab308", legacy: "bg-yellow-500" },
  { name: "Lime", hex: "#84cc16", legacy: "bg-lime-500" },
  { name: "Green", hex: "#22c55e", legacy: "bg-green-500" },
  { name: "Emerald", hex: "#10b981", legacy: "bg-emerald-500" },
  { name: "Teal", hex: "#14b8a6", legacy: "bg-teal-500" },
  { name: "Cyan", hex: "#06b6d4", legacy: "bg-cyan-500" },
  { name: "Sky", hex: "#0ea5e9", legacy: "bg-sky-500" },
  { name: "Slate", hex: "#64748b", legacy: "bg-slate-500" },
  { name: "Gray", hex: "#6b7280", legacy: "bg-gray-500" },
  { name: "Zinc", hex: "#71717a", legacy: "bg-zinc-500" },
  { name: "Black", hex: "#18181b", legacy: "bg-zinc-900" },
];

const LEGACY_TO_HEX: Record<string, string> = Object.fromEntries(
  PRESETS.filter((p) => p.legacy).map((p) => [p.legacy!, p.hex])
);

function normalizeColor(raw: string): string {
  const v = (raw || "").trim();
  if (!v) return "#3b82f6";
  if (LEGACY_TO_HEX[v]) return LEGACY_TO_HEX[v];
  const m = v.match(/#([0-9a-fA-F]{3,8})/);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return `#${h.slice(0, 6).toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const h = v.slice(1);
    return `#${h.split("").map((c) => c + c).join("")}`;
  }
  return v.startsWith("#") ? v : `#${v}`;
}

type Props = {
  value: string;
  onChange: (color: string) => void;
  label?: string;
};

export default function BrandColorPicker({
  value,
  onChange,
  label = "Brand color",
}: Props) {
  const hex = normalizeColor(value);
  const selected = PRESETS.find((p) => p.hex.toLowerCase() === hex.toLowerCase());

  return (
    <div className="sm:col-span-2">
      <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
        {label}
      </span>
      <p className="mb-2 text-[11px] text-[var(--muted-foreground)]">
        Pick a color from the palette, or type / paste a hex code (e.g. #3b82f6).
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = p.hex.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={p.hex}
              type="button"
              title={p.name}
              onClick={() => onChange(p.hex)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                active
                  ? "border-[var(--foreground)] scale-110 shadow-sm"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: p.hex }}
              aria-label={p.name}
              aria-pressed={active}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-xs text-[var(--muted-foreground)]">Picker</span>
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#3b82f6"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent p-1"
          />
        </label>
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
          <span className="shrink-0 text-xs text-[var(--muted-foreground)]">Hex</span>
          <input
            type="text"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onChange(normalizeColor(e.target.value))}
            placeholder="#3b82f6"
            className="w-full max-w-[10rem] rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm uppercase"
            spellCheck={false}
          />
        </label>
        <div
          className="h-10 w-10 shrink-0 rounded-xl border border-[var(--border)] shadow-inner"
          style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/i.test(hex) ? hex : "#ccc" }}
          title={selected?.name || hex}
          aria-hidden
        />
        {selected && (
          <span className="text-xs text-[var(--muted-foreground)]">{selected.name}</span>
        )}
      </div>
    </div>
  );
}

export function brandColorCss(raw: string | undefined | null): string {
  return normalizeColor(raw || "#3b82f6");
}
