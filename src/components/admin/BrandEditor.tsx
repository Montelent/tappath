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

const emptyBrand = (): BrandRow => ({
  slug: "",
  name: "",
  color: "bg-blue-500",
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
        setUsingDb(!!data.usingSupabase);
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

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.slug.trim()) {
      setMessage("Name and slug are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const isNew = !editing.id;
      const res = await fetch("/api/admin/content/brands", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editing),
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
          <button type="button" onClick={() => setEditing(emptyBrand())} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
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
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Slug</span>
              <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Color class</span>
              <input value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Sort order</span>
              <input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Description</span>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">SEO — Updates text</span>
              <textarea value={editing.seo_updates} onChange={(e) => setEditing({ ...editing, seo_updates: e.target.value })} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">SEO — Help text</span>
              <textarea value={editing.seo_help} onChange={(e) => setEditing({ ...editing, seo_help: e.target.value })} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Product lines</h3>
              <button type="button" className="text-xs text-brand-600" onClick={() => setEditing({ ...editing, product_lines: [...(editing.product_lines || []), { name: "", count: 0, href: "" }] })}>
                + Line
              </button>
            </div>
            <div className="space-y-2">
              {(editing.product_lines || []).map((pl, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-4">
                  <input placeholder="Name" value={pl.name} onChange={(e) => { const product_lines = [...editing.product_lines]; product_lines[i] = { ...pl, name: e.target.value }; setEditing({ ...editing, product_lines }); }} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm" />
                  <input type="number" placeholder="Count" value={pl.count} onChange={(e) => { const product_lines = [...editing.product_lines]; product_lines[i] = { ...pl, count: Number(e.target.value) }; setEditing({ ...editing, product_lines }); }} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm" />
                  <input placeholder="/samsung/galaxy" value={pl.href} onChange={(e) => { const product_lines = [...editing.product_lines]; product_lines[i] = { ...pl, href: e.target.value }; setEditing({ ...editing, product_lines }); }} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm" />
                  <button type="button" className="text-left text-xs text-red-500" onClick={() => setEditing({ ...editing, product_lines: editing.product_lines.filter((_, j) => j !== i) })}>Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Top guides</h3>
              <button type="button" className="text-xs text-brand-600" onClick={() => setEditing({ ...editing, top_guides: [...(editing.top_guides || []), { title: "", href: "", category: "" }] })}>
                + Guide
              </button>
            </div>
            <div className="space-y-2">
              {(editing.top_guides || []).map((g, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-4">
                  <input placeholder="Title" value={g.title} onChange={(e) => { const top_guides = [...editing.top_guides]; top_guides[i] = { ...g, title: e.target.value }; setEditing({ ...editing, top_guides }); }} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm" />
                  <input placeholder="/samsung/..." value={g.href} onChange={(e) => { const top_guides = [...editing.top_guides]; top_guides[i] = { ...g, href: e.target.value }; setEditing({ ...editing, top_guides }); }} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm" />
                  <input placeholder="Category" value={g.category} onChange={(e) => { const top_guides = [...editing.top_guides]; top_guides[i] = { ...g, category: e.target.value }; setEditing({ ...editing, top_guides }); }} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm" />
                  <button type="button" className="text-left text-xs text-red-500" onClick={() => setEditing({ ...editing, top_guides: editing.top_guides.filter((_, j) => j !== i) })}>Remove</button>
                </div>
              ))}
            </div>
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
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                <th className="px-3 py-2.5">Name</th>
                <th className="px-3 py-2.5">Slug</th>
                <th className="px-3 py-2.5">Guides</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-[var(--muted)]/30">
                  <td className="px-3 py-2.5 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{row.slug}</td>
                  <td className="px-3 py-2.5">{row.guides_count}</td>
                  <td className="px-3 py-2.5">
                    {row.published ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Live</span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">Draft</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <Link href={`/${row.slug}`} target="_blank" className="mr-2 text-[var(--muted-foreground)]"><ExternalLink className="inline h-3.5 w-3.5" /></Link>
                    <button type="button" onClick={() => setEditing({ ...emptyBrand(), ...row, product_lines: Array.isArray(row.product_lines) ? row.product_lines : [], top_guides: Array.isArray(row.top_guides) ? row.top_guides : [], devices_list: Array.isArray(row.devices_list) ? row.devices_list : [] })} className="mr-2 text-brand-600">Edit</button>
                    <button type="button" onClick={() => row.id && remove(String(row.id))} className="text-red-600"><Trash2 className="inline h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-[var(--muted-foreground)]">No brands. Connect Neon and Seed DB.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
