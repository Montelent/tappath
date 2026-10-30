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

type Faq = { q: string; a: string };
type Related = { title: string; href: string; category: string };
type Device = { name: string; os: string; href: string };
type Version = { label: string; note?: string };

type GuideRow = {
  id?: string;
  slug: string;
  brand: string;
  brand_slug: string;
  product_line: string;
  title: string;
  short_description: string;
  updated_label: string;
  read_time: string;
  category: string;
  versions: Version[];
  article: string[];
  faqs: Faq[];
  related: Related[];
  compatible_devices: Device[];
  confirmations: number;
  forum_verified: boolean;
  published: boolean;
};

const emptyGuide = (): GuideRow => ({
  slug: "",
  brand: "Samsung",
  brand_slug: "samsung",
  product_line: "Galaxy",
  title: "",
  short_description: "",
  updated_label: "Just now",
  read_time: "2 min",
  category: "Settings",
  versions: [{ label: "One UI 6" }],
  article: [""],
  faqs: [{ q: "", a: "" }],
  related: [],
  compatible_devices: [],
  confirmations: 0,
  forum_verified: false,
  published: false,
});

function previewHref(g: GuideRow) {
  if (!g.brand_slug || !g.product_line || !g.slug) return null;
  const pl = g.product_line.toLowerCase().replace(/\s+/g, "-");
  return `/${g.brand_slug}/${pl}/${g.slug}`;
}

export default function GuideEditor() {
  const [rows, setRows] = useState<GuideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [editing, setEditing] = useState<GuideRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content/guides", { credentials: "include" });
      const data = await res.json();
      if (!res.ok && data.error && !data.rows) {
        setError(data.error);
        setRows([]);
        setUsingDb(false);
      } else {
        setRows((data.rows || []) as GuideRow[]);
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
    if (!editing.title.trim() || !editing.slug.trim() || !editing.brand_slug.trim()) {
      setMessage("Title, slug, and brand_slug are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        ...editing,
        article: (editing.article || []).filter((p) => p.trim()),
        faqs: (editing.faqs || []).filter((f) => f.q.trim()),
        versions: editing.versions || [],
        related: editing.related || [],
        compatible_devices: editing.compatible_devices || [],
      };
      const isNew = !editing.id;
      const res = await fetch("/api/admin/content/guides", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Save failed — is DATABASE_URL set?");
      } else {
        setMessage(payload.published ? "Saved & published to site" : "Saved as draft");
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
    if (!confirm("Delete this guide permanently?")) return;
    const res = await fetch(`/api/admin/content/guides?id=${encodeURIComponent(id)}`, {
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
        setMessage(`Seeded into Neon: ${JSON.stringify(data.results)}`);
        await load();
      }
    } catch {
      setMessage("Seed network error");
    } finally {
      setSeeding(false);
    }
  };

  const filtered = rows.filter((r) => {
    if (filter === "published") return r.published;
    if (filter === "draft") return !r.published;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guides</h1>
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
          <button type="button" onClick={() => setEditing(emptyGuide())} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
            <Plus className="h-3.5 w-3.5" /> New guide
          </button>
        </div>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>
      )}

      <div className="flex gap-2">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white"
                : "rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]"
            }
          >
            {f === "all" ? `All (${rows.length})` : f === "published" ? "Published" : "Drafts"}
          </button>
        ))}
      </div>

      {editing && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{editing.id ? "Edit guide" : "Create guide"}</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                className="h-4 w-4"
              />
              {editing.published ? (
                <span className="inline-flex items-center gap-1 text-emerald-600"><Eye className="h-3.5 w-3.5" /> Published on site</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600"><EyeOff className="h-3.5 w-3.5" /> Draft (hidden)</span>
              )}
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["title", "Title"],
                ["slug", "URL slug"],
                ["brand", "Brand name"],
                ["brand_slug", "Brand slug"],
                ["product_line", "Product line"],
                ["category", "Category"],
                ["read_time", "Read time"],
                ["updated_label", "Updated label"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
                <input
                  value={String(editing[key] ?? "")}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                />
              </label>
            ))}
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Short description</span>
              <textarea
                value={editing.short_description}
                onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Article steps / paragraphs</h3>
              <button type="button" className="text-xs text-brand-600" onClick={() => setEditing({ ...editing, article: [...(editing.article || []), ""] })}>
                + Add step
              </button>
            </div>
            <div className="space-y-2">
              {(editing.article || []).map((p, i) => (
                <div key={i} className="flex gap-2">
                  <span className="mt-2 w-6 text-xs text-[var(--muted-foreground)]">{i + 1}.</span>
                  <textarea
                    value={p}
                    onChange={(e) => {
                      const article = [...editing.article];
                      article[i] = e.target.value;
                      setEditing({ ...editing, article });
                    }}
                    rows={2}
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <button type="button" className="text-red-500" onClick={() => setEditing({ ...editing, article: editing.article.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">FAQs</h3>
              <button type="button" className="text-xs text-brand-600" onClick={() => setEditing({ ...editing, faqs: [...(editing.faqs || []), { q: "", a: "" }] })}>
                + Add FAQ
              </button>
            </div>
            <div className="space-y-3">
              {(editing.faqs || []).map((f, i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] p-3">
                  <input
                    placeholder="Question"
                    value={f.q}
                    onChange={(e) => {
                      const faqs = [...editing.faqs];
                      faqs[i] = { ...faqs[i], q: e.target.value };
                      setEditing({ ...editing, faqs });
                    }}
                    className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                  />
                  <textarea
                    placeholder="Answer"
                    value={f.a}
                    onChange={(e) => {
                      const faqs = [...editing.faqs];
                      faqs[i] = { ...faqs[i], a: e.target.value };
                      setEditing({ ...editing, faqs });
                    }}
                    rows={2}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                  />
                  <button type="button" className="mt-1 text-xs text-red-500" onClick={() => setEditing({ ...editing, faqs: editing.faqs.filter((_, j) => j !== i) })}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">OS / UI versions</h3>
              <button type="button" className="text-xs text-brand-600" onClick={() => setEditing({ ...editing, versions: [...(editing.versions || []), { label: "" }] })}>
                + Version
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(editing.versions || []).map((v, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    value={v.label}
                    onChange={(e) => {
                      const versions = [...editing.versions];
                      versions[i] = { ...versions[i], label: e.target.value };
                      setEditing({ ...editing, versions });
                    }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
                    placeholder="One UI 6"
                  />
                  <button type="button" className="text-red-500" onClick={() => setEditing({ ...editing, versions: editing.versions.filter((_, j) => j !== i) })}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} disabled={saving || !usingDb} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save to database
            </button>
            {previewHref(editing) && (
              <Link href={previewHref(editing)!} target="_blank" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm">
                <ExternalLink className="h-4 w-4" /> Preview on site
              </Link>
            )}
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                <th className="px-3 py-2.5">Title</th>
                <th className="px-3 py-2.5">Brand</th>
                <th className="px-3 py-2.5">Slug</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((row) => {
                const href = previewHref(row);
                return (
                  <tr key={String(row.id)} className="hover:bg-[var(--muted)]/30">
                    <td className="px-3 py-2.5 font-medium">{row.title}</td>
                    <td className="px-3 py-2.5">{row.brand}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{row.slug}</td>
                    <td className="px-3 py-2.5">
                      {row.published ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Live</span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">Draft</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      {href && (
                        <Link href={href} target="_blank" className="mr-2 text-[var(--muted-foreground)]">
                          <ExternalLink className="inline h-3.5 w-3.5" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...emptyGuide(),
                            ...row,
                            article: Array.isArray(row.article) ? row.article : [],
                            faqs: Array.isArray(row.faqs) ? row.faqs : [],
                            versions: Array.isArray(row.versions) ? (row.versions as Version[]) : [],
                            related: Array.isArray(row.related) ? row.related : [],
                            compatible_devices: Array.isArray(row.compatible_devices) ? row.compatible_devices : [],
                          })
                        }
                        className="mr-2 text-brand-600"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => row.id && remove(String(row.id))} className="text-red-600">
                        <Trash2 className="inline h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[var(--muted-foreground)]">
                    No guides. Connect Neon and click Seed DB, or create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
