const LEGACY: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-blue-600": "#2563eb",
  "bg-indigo-500": "#6366f1",
  "bg-violet-500": "#8b5cf6",
  "bg-purple-500": "#a855f7",
  "bg-pink-500": "#ec4899",
  "bg-rose-500": "#f43f5e",
  "bg-red-500": "#ef4444",
  "bg-red-600": "#dc2626",
  "bg-orange-500": "#f97316",
  "bg-amber-500": "#f59e0b",
  "bg-yellow-500": "#eab308",
  "bg-lime-500": "#84cc16",
  "bg-green-500": "#22c55e",
  "bg-emerald-500": "#10b981",
  "bg-teal-500": "#14b8a6",
  "bg-cyan-500": "#06b6d4",
  "bg-sky-500": "#0ea5e9",
  "bg-slate-500": "#64748b",
  "bg-gray-500": "#6b7280",
  "bg-zinc-500": "#71717a",
  "bg-zinc-900": "#18181b",
};

export function brandColorCss(raw: string | null | undefined): string {
  const v = (raw || "").trim();
  if (!v) return "#c23b22";
  if (LEGACY[v]) return LEGACY[v];
  const m = v.match(/#([0-9a-fA-F]{3,8})/);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return `#${h.slice(0, 6).toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  if (/^#[0-9a-fA-F]{6}$/i.test(v)) return v.toLowerCase();
  return "#c23b22";
}

export function brandColorTint(raw: string | null | undefined, alpha = 0.12): string {
  const hex = brandColorCss(raw).replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
