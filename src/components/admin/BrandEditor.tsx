"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import BrandColorPicker from "@/components/admin/BrandColorPicker";
import SortOrderField, { nextSortOrder } from "@/components/admin/SortOrderField";

type ProductLine = { name: string; count: number; href: string };
type TopGuide = { title: string; href: string; category: string };
type DeviceItem = { name: string; os: string; href: string };

type BrandRow = {
  id?: string;
  slug: string;
  name: string;
  color: string;
  description: string;
  guides_count: number;
  devices_count: number;
  product_lines: ProductLine[];
  top_guides: TopGuide[];
  devices_list: DeviceItem[];
  seo_updates: string;
  seo_help: string;
  published: boolean;
  sort_order: number;
};

const slugifyBrand = (value: string) => value.normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const emptyBrand = (): BrandRow => ({
  slug: "",
  name: "",
  color: "#3b82f6",
  description: "",
  guides_count: 0,
  devices_count: 0,
  product_lines: [],
  top_guides: [],
  devices_list: [],
  seo_updates: "",
  seo_help: "",
  published: false,
  sort_order: 0,
});

export default function BrandEditor() {
  const [rows, setRows] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const [autoGuides, setAutoGuides] = useState<TopGuide[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content/brands", { credentials: "include" });
      const data = await res.json();
      if (!res.ok && data.error && !data.rows) {
        setError(data.error);
        setRows([]);
        setUsingDb(false);
      } else {
        setRows((data.rows || []) as BrandRow[]);
        setUsingDb(!!data.usingSupabase || !!data.usingDb);
        if (data.error) setError(data.error);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (editing?.slug) void loadAutoGuides(editing.slug);
    else setAutoGuides([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.slug]);

  const guidePath = (g: Record<string, unknown>, brand: string) => {
    if (g.href && typeof g.href === "string") return g.href;
    const line = String(g.product_line || "guides")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || "guides";
    return `/${brand}/${line}/${g.slug}`;
  };

  const loadAutoGuides = async (slug: string) => {
    if (!slug) {
      setAutoGuides([]);
      return;
    }
    setLoadingGuides(true);
    try {
      const res = await fetch("/api/admin/content/guides", { credentials: "include" });
      const data = await res.json();
      const guideRows = (data.rows || []) as Record<string, unknown>[];
      const brandGuides = guideRows.filter(
        (g) =>
          String(g.brand_slug || "").toLowerCase() === slug.toLowerCase() &&
          g.published !== false
      );
      const mapped: TopGuide[] = brandGuides.map((g) => ({
        title: String(g.title || g.slug || ""),
        href: guidePath(g, slug),
        category: String(g.category || "General"),
      }));
      setAutoGuides(mapped);
      setEditing((prev) => {
        if (!prev || prev.slug.toLowerCase() !== slug.toLowerCase()) return prev;
        const lineMap = new Map<string, number>();
        for (const g of brandGuides) {
          const line = String(g.product_line || "Guides");
          lineMap.set(line, (lineMap.get(line) || 0) + 1);
        }
        const product_lines = Array.from(lineMap.entries()).map(([name, count]) => ({
          name,
          count,
          href: `/${slug}/${name.toLowerCase().replace(/\s+/g, "-")}`,
        }));
        return { ...prev, guides_count: brandGuides.length, top_guides: mapped, product_lines };
      });
    } catch {
      setAutoGuides([]);
    } finally {
      setLoadingGuides(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    const requestedSlug = editing.slug.trim();
    if (!editing.name.trim() || !requestedSlug) {
      setMessage("Enter a valid brand name to generate its URL slug.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const isNew = !editing.id;
      const payload = {
        ...editing,
        slug: requestedSlug,
        top_guides: autoGuides,
        guides_count: autoGuides.length,
      };
      const res = await fetch("/api/admin/content/brands", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed — is DATABASE_URL set?");
      else {
        setMessage(editing.published ? "Saved & published" : "Saved as draft");
        setEditing(null);
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    const res = await fetch(`/api/admin/content/brands?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) await load();
    else {
      const data = await res.json();
      setMessage(data.error || "Delete failed");
    }
  };

  const seed = async () => {
    setSeeding(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Seed failed");
      else {
        setMessage(`Seeded: ${JSON.stringify(data.results)}`);
        await load();
      }
    } catch {
      setMessage("Seed network error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {usingDb ? (
              <span className="text-emerald-600">Neon connected — edits persist</span>
            ) : (
              <span className="text-amber-600">DATABASE_URL missing — set on Vercel & seed</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => load()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button type="button" onClick={seed} disabled={seeding} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
            {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
            Seed DB
          </button>
          <button
            type="button"
            onClick={() => setEditing({ ...emptyBrand(), sort_order: nextSortOrder(rows), color: "#3b82f6" })}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New brand
          </button>
        </div>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>
      )}

      {editing && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{editing.id ? "Edit brand" : "Create brand"}</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="h-4 w-4" />
              {editing.published ? (
                <span className="inline-flex items-center gap-1 text-emerald-600"><Eye className="h-3.5 w-3.5" /> On homepage / brand pages</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600"><EyeOff className="h-3.5 w-3.5" /> Hidden</span>
              )}
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Name</span>
              <input value={editing.name} onChange={(e) => { const name = e.target.value; setEditing((prev) => prev ? { ...prev, name, ...(!prev.id ? { slug: slugifyBrand(name) } : {}) } : prev); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Slug</span>
              <input value={editing.slug} onChange={(e) => setEditing((prev) => prev ? { ...prev, slug: e.target.value } : prev)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
              <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">Auto-generated when creating. During editing, it stays unchanged unless you edit it manually.</span>
            </label>
            <BrandColorPicker value={editing.color} onChange={(color) => setEditing({ ...editing, color })} />
            <div>
              <SortOrderField
                value={editing.sort_order}
                onChange={(n) => setEditing({ ...editing, sort_order: n })}
                autoValue={nextSortOrder(rows, editing.id)}
              />
            </div>
            <div className="sm:col-span-2">
              <RichTextEditor label="Description" value={editing.description || ""} onChange={(html) => setEditing({ ...editing, description: html })} minHeight={140} compact placeholder="Brand description…" />
            </div>
            <div className="sm:col-span-2">
              <RichTextEditor label="SEO — Updates text" value={editing.seo_updates || ""} onChange={(html) => setEditing({ ...editing, seo_updates: html })} minHeight={120} compact />
            </div>
            <div className="sm:col-span-2">
              <RichTextEditor label="SEO — Help text" value={editing.seo_help || ""} onChange={(html) => setEditing({ ...editing, seo_help: html })} minHeight={120} compact />
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">Guides (automatic)</h3>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Pulled from published guides with brand_slug “{editing.slug || "…"}”. No manual add — public brand page uses the same list.
                </p>
              </div>
              <button type="button" className="inline-flex items-center gap-1 text-xs text-brand-600" disabled={!editing.slug || loadingGuides} onClick={() => loadAutoGuides(editing.slug)}>
                {loadingGuides ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Refresh guides
              </button>
            </div>
            {autoGuides.length === 0 && !loadingGuides ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
                No published guides yet. Create under <Link href="/admin/guides" className="text-brand-600 underline">Admin → Guides</Link> with this brand slug.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                {(autoGuides.length > 0 ? autoGuides : editing.top_guides || []).map((g, i) => (
                  <li key={`${g.href}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="font-medium">{g.title || "Untitled"}</span>
                      {g.category && <span className="ml-2 text-xs text-[var(--muted-foreground)]">{g.category}</span>}
                    </span>
                    <Link href={g.href || "#"} target="_blank" className="shrink-0 font-mono text-xs text-brand-600 hover:underline">{g.href}</Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">Count: {editing.guides_count}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={saving || !usingDb} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save to database
            </button>
            {editing.slug && (
              <Link href={`/${editing.slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm">
                <ExternalLink className="h-4 w-4" /> Preview brand page
              </Link>
            )}
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Name</th>
                <th className="whitespace-nowrap px-4 py-3">Slug</th>
                <th className="whitespace-nowrap px-4 py-3">Guides</th>
                <th className="whitespace-nowrap px-4 py-3">Devices</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="w-[260px] whitespace-nowrap px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-[var(--muted)]/30">
                  <td className="max-w-[280px] break-words px-4 py-4 font-medium">{row.name}</td>
                  <td className="px-4 py-4 font-mono text-xs">{row.slug}</td>
                  <td className="px-4 py-4 tabular-nums">{row.guides_count ?? 0}</td>
                  <td className="px-4 py-4 tabular-nums">{row.devices_count ?? 0}</td>
                  <td className="px-4 py-4">
                    {row.published ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Live</span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link href={`/${row.slug}`} target="_blank" className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]">
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </Link>
                      <button type="button" onClick={() => {
                        const next = {
                          ...emptyBrand(),
                          ...row,
                          product_lines: Array.isArray(row.product_lines) ? row.product_lines : [],
                          top_guides: Array.isArray(row.top_guides) ? row.top_guides : [],
                          devices_list: Array.isArray(row.devices_list) ? row.devices_list : [],
                        };
                        setEditing(next);
                        void loadAutoGuides(String(next.slug || ""));
                      }} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-[var(--muted)]">
                        Edit
                      </button>
                      <button type="button" onClick={() => row.id && remove(String(row.id))} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
                        <Trash2 className="h-3.5 w-3.5" /> Trash
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-[var(--muted-foreground)]">No brands. Connect Neon and Seed DB.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
