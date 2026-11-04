"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, AlertCircle, Search, Share2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SeoMetaValue = {
  focus_keyword?: string;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  robots_index?: boolean;
  robots_follow?: boolean;
  og_title?: string;
  og_description?: string;
  og_image?: string;
};

type Props = {
  value: SeoMetaValue;
  onChange: (next: SeoMetaValue) => void;
  defaultTitle: string;
  defaultDescription: string;
  pathPreview: string;
  /** Optional override; when omitted the box detects the live browser host. */
  siteHost?: string;
  imageUrl?: string;
  className?: string;
};

type Tab = "general" | "social" | "advanced";

function scoreLen(len: number, goodMin: number, goodMax: number, okMin: number, okMax: number) {
  if (len >= goodMin && len <= goodMax) return "good" as const;
  if (len >= okMin && len <= okMax) return "ok" as const;
  if (len === 0) return "empty" as const;
  return "bad" as const;
}

function barColor(s: "good" | "ok" | "bad" | "empty") {
  if (s === "good") return "bg-emerald-500";
  if (s === "ok") return "bg-amber-400";
  if (s === "bad") return "bg-red-500";
  return "bg-[var(--border)]";
}

function textColor(s: "good" | "ok" | "bad" | "empty") {
  if (s === "good") return "text-emerald-600 dark:text-emerald-400";
  if (s === "ok") return "text-amber-600 dark:text-amber-400";
  if (s === "bad") return "text-red-600 dark:text-red-400";
  return "text-[var(--muted-foreground)]";
}

export default function SeoMetaBox({
  value,
  onChange,
  defaultTitle,
  defaultDescription,
  pathPreview,
  siteHost,
  imageUrl,
  className,
}: Props) {
  const [tab, setTab] = useState<Tab>("general");
  // Auto-detect the real site host in the browser (WordPress-style — never hardcode a domain).
  const [autoHost, setAutoHost] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined" && window.location?.host) {
      setAutoHost(window.location.host);
    }
  }, []);

  const set = <K extends keyof SeoMetaValue>(key: K, v: SeoMetaValue[K]) =>
    onChange({ ...value, [key]: v });

  const displayTitle = (value.seo_title || defaultTitle || "").trim();
  const displayDesc = (value.seo_description || defaultDescription || "").trim();
  const kw = (value.focus_keyword || "").trim().toLowerCase();

  const titleScore = scoreLen(displayTitle.length, 30, 60, 20, 70);
  const descScore = scoreLen(displayDesc.length, 120, 160, 70, 180);

  const checks = useMemo(() => {
    const list: { ok: boolean; label: string }[] = [];
    if (kw) {
      list.push({
        ok: displayTitle.toLowerCase().includes(kw),
        label: "Focus keyword appears in the SEO title",
      });
      list.push({
        ok: displayDesc.toLowerCase().includes(kw),
        label: "Focus keyword appears in the meta description",
      });
      list.push({
        ok: pathPreview.toLowerCase().includes(kw.replace(/\s+/g, "-")),
        label: "Focus keyword appears in the URL",
      });
    }
    list.push({ ok: titleScore === "good", label: "SEO title length is optimal (30–60 characters)" });
    list.push({ ok: descScore === "good", label: "Meta description length is optimal (120–160 characters)" });
    list.push({ ok: !!displayTitle, label: "SEO title is set" });
    list.push({ ok: !!displayDesc, label: "Meta description is set" });
    return list;
  }, [kw, displayTitle, displayDesc, pathPreview, titleScore, descScore]);

  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length;
  const overall =
    total === 0 ? "empty" : passed / total >= 0.8 ? "good" : passed / total >= 0.5 ? "ok" : "bad";

  const host = (siteHost || autoHost || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const path = pathPreview.startsWith("/") ? pathPreview : `/${pathPreview}`;
  const crumbs = path.split("/").filter(Boolean).slice(0, 3);
  const canonicalPlaceholder = host ? `https://${host}${path}` : path;

  const tabs: { id: Tab; label: string; icon: typeof Search }[] = [
    { id: "general", label: "General", icon: Search },
    { id: "social", label: "Social", icon: Share2 },
    { id: "advanced", label: "Advanced", icon: Settings2 },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">SEO</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">RankMath-style controls for this page</p>
          </div>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            overall === "good" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
            overall === "ok" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            overall === "bad" && "bg-red-500/15 text-red-700 dark:text-red-300",
            overall === "empty" && "bg-[var(--muted)] text-[var(--muted-foreground)]"
          )}
        >
          {overall === "good" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : overall === "bad" ? (
            <AlertCircle className="h-3.5 w-3.5" />
          ) : (
            <Circle className="h-3.5 w-3.5" />
          )}
          {passed}/{total} checks
        </div>
      </div>

      <div className="flex border-b border-[var(--border)]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
                active
                  ? "border-b-2 border-brand-600 text-brand-600"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 p-4">
        {tab === "general" && (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Focus keyword</span>
              <input
                value={value.focus_keyword || ""}
                onChange={(e) => set("focus_keyword", e.target.value)}
                placeholder="e.g. add fingerprint samsung"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">
                Optional. Used for the checklist below — not shown on the public page.
              </span>
            </label>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--muted-foreground)]">Google preview</div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-3 dark:bg-[#202124]">
                <div className="truncate text-[14px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
                  {displayTitle || "Page title will appear here"}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-[#006621] dark:text-[#bdc1c6]">
                  {host || "…"}
                  {crumbs.length > 0 && (
                    <span className="text-[#5f6368] dark:text-[#9aa0a6]"> › {crumbs.join(" › ")}</span>
                  )}
                </div>
                <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#4d5156] dark:text-[#bdc1c6]">
                  {displayDesc ||
                    "Meta description will appear here. Write a compelling summary so people click from search results."}
                </div>
              </div>
            </div>

            <label className="block">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--muted-foreground)]">SEO title</span>
                <span className={cn("text-[11px] font-medium tabular-nums", textColor(titleScore))}>
                  {displayTitle.length}/60
                </span>
              </div>
              <input
                value={value.seo_title || ""}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder={defaultTitle || "SEO title"}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                maxLength={70}
              />
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className={cn("h-full transition-all", barColor(titleScore))}
                  style={{ width: `${Math.min(100, (displayTitle.length / 60) * 100)}%` }}
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--muted-foreground)]">Meta description</span>
                <span className={cn("text-[11px] font-medium tabular-nums", textColor(descScore))}>
                  {displayDesc.length}/160
                </span>
              </div>
              <textarea
                value={value.seo_description || ""}
                onChange={(e) => set("seo_description", e.target.value)}
                placeholder={defaultDescription || "Write a clear summary for search results…"}
                rows={3}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                maxLength={200}
              />
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className={cn("h-full transition-all", barColor(descScore))}
                  style={{ width: `${Math.min(100, (displayDesc.length / 160) * 100)}%` }}
                />
              </div>
            </label>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Basic SEO analysis
              </div>
              <ul className="space-y-1.5">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-start gap-2 text-xs">
                    {c.ok ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
                    )}
                    <span className={c.ok ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}>
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {tab === "social" && (
          <>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Overrides for Facebook, LinkedIn, and other Open Graph shares. Leave blank to use the SEO title /
              description and featured image.
            </p>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--muted-foreground)]">Social preview</div>
              <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white dark:bg-[#242526]">
                {value.og_image || imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={value.og_image || imageUrl}
                    alt=""
                    className="aspect-[1.91/1] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
                    No image — set Featured image or OG image below
                  </div>
                )}
                <div className="space-y-0.5 border-t border-[var(--border)] p-3">
                  <div className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">{host || "…"}</div>
                  <div className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">
                    {(value.og_title || displayTitle || "Title").trim()}
                  </div>
                  <div className="line-clamp-2 text-xs text-[var(--muted-foreground)]">
                    {(value.og_description || displayDesc || "Description").trim()}
                  </div>
                </div>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Social title</span>
              <input
                value={value.og_title || ""}
                onChange={(e) => set("og_title", e.target.value)}
                placeholder={displayTitle || "Same as SEO title"}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Social description</span>
              <textarea
                value={value.og_description || ""}
                onChange={(e) => set("og_description", e.target.value)}
                placeholder={displayDesc || "Same as meta description"}
                rows={2}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Social image URL</span>
              <input
                type="url"
                value={value.og_image || ""}
                onChange={(e) => set("og_image", e.target.value)}
                placeholder={imageUrl || "Uses featured image if empty"}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </label>
          </>
        )}

        {tab === "advanced" && (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Canonical URL</span>
              <input
                type="url"
                value={value.canonical_url || ""}
                onChange={(e) => set("canonical_url", e.target.value)}
                placeholder={canonicalPlaceholder}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm"
              />
              <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">
                Leave empty to use the default page URL.
              </span>
            </label>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-3">
              <div className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">Robots meta</div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value.robots_index !== false}
                    onChange={(e) => set("robots_index", e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border)]"
                  />
                  Index
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value.robots_follow !== false}
                    onChange={(e) => set("robots_follow", e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border)]"
                  />
                  Follow
                </label>
              </div>
              <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
                Uncheck Index to ask search engines not to list this page (noindex). Uncheck Follow to avoid
                passing link equity (nofollow).
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
