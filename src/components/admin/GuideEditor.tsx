"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2, Plus, Trash2, Save, RefreshCw, Database, ExternalLink, Eye, EyeOff, Image as ImageIcon,
} from "lucide-react";
import SearchableSelect from "@/components/admin/SearchableSelect";
import GuideVersionsEditor from "@/components/admin/GuideVersionsEditor";
import RichTextEditor from "@/components/admin/RichTextEditor";
import GuideMetaFields from "@/components/admin/GuideMetaFields";
import SeoMetaBox from "@/components/admin/SeoMetaBox";
import {
  slugify, formatUpdatedLabel, formatModifiedDate, estimateReadTime, GUIDE_CATEGORIES,
} from "@/lib/admin/guideHelpers";

type Faq = { q: string; a: string };
type Version = {
  id?: string;
  label: string;
  steps?: {
    id?: number;
    instruction?: string;
    highlight?: string;
    detail?: string;
    imageUrl?: string;
    markerX?: number;
    markerY?: number;
  }[];
};
type GuideRow = {
  id?: string; slug: string; brand: string; brand_slug: string; product_line: string;
  title: string; short_description: string; updated_label: string; read_time: string;
  category: string; versions: Version[]; article: string[]; faqs: Faq[];
  related: { title: string; href: string; category: string }[];
  compatible_devices: { name: string; os: string; href: string }[];
  confirmations: number; forum_verified: boolean; published: boolean;
  updated_at?: string;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  robots_index?: boolean;
  robots_follow?: boolean;
  og_title?: string;
  og_description?: string;
  og_image?: string;
};

type BrandOpt = { name: string; slug: string; product_lines: { name: string }[] };

const emptyGuide = (): GuideRow => ({
  slug: "", brand: "Samsung", brand_slug: "samsung", product_line: "Galaxy",
  title: "", short_description: "", updated_label: formatUpdatedLabel(), read_time: "1 min",
  category: "Display & Home Screen",
  versions: [{ id: "v1", label: "Latest", steps: [{ instruction: "", highlight: "" }] }],
  article: [""], faqs: [{ q: "", a: "" }], related: [], compatible_devices: [],
  confirmations: 0, forum_verified: false, published: false,
  featured_image_url: "",
  seo_title: "",
  seo_description: "",
  focus_keyword: "",
  canonical_url: "",
  robots_index: true,
  robots_follow: true,
  og_title: "",
  og_description: "",
  og_image: "",
});

function previewHref(g: GuideRow) {
  if (!g.brand_slug || !g.product_line || !g.slug) return null;
  return `/${g.brand_slug}/${slugify(g.product_line)}/${g.slug}`;
}

const FALLBACK_BRANDS: BrandOpt[] = [
  { name: "Samsung", slug: "samsung", product_lines: [{ name: "Galaxy" }] },
  { name: "Xiaomi", slug: "xiaomi", product_lines: [{ name: "Smartphone" }, { name: "Redmi" }, { name: "POCO" }] },
  { name: "Google", slug: "google", product_lines: [{ name: "Pixel" }] },
  { name: "OnePlus", slug: "oneplus", product_lines: [{ name: "OnePlus" }] },
  { name: "Oppo", slug: "oppo", product_lines: [{ name: "Find" }, { name: "Reno" }] },
  { name: "Realme", slug: "realme", product_lines: [{ name: "Realme" }] },
  { name: "Huawei", slug: "huawei", product_lines: [{ name: "P series" }, { name: "Mate" }] },
  { name: "Android", slug: "android", product_lines: [{ name: "Generic" }] },
];

export default function GuideEditor() {
  const [rows, setRows] = useState<GuideRow[]>([]);
  const [brands, setBrands] = useState<BrandOpt[]>(FALLBACK_BRANDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [editing, setEditing] = useState<GuideRow | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [listSearch, setListSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [gRes, bRes] = await Promise.all([
        fetch("/api/admin/content/guides", { credentials: "include" }),
        fetch("/api/admin/content/brands", { credentials: "include" }),
      ]);
      const gData = await gRes.json();
      const bData = await bRes.json();
      if (!gRes.ok && gData.error && !gData.rows) {
        setError(gData.error); setRows([]); setUsingDb(false);
      } else {
        setRows((gData.rows || []) as GuideRow[]);
        setUsingDb(!!gData.usingSupabase);
        if (gData.error) setError(gData.error);
      }
      const brandRows = (bData.rows || []) as Record<string, unknown>[];
      if (brandRows.length) {
        setBrands(brandRows.map((b) => ({
          name: String(b.name || ""),
          slug: String(b.slug || ""),
          product_lines: Array.isArray(b.product_lines) ? (b.product_lines as { name: string }[]) : [],
        })));
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.slug, label: b.name, meta: b.slug })),
    [brands]
  );

  const productLineOptions = useMemo(() => {
    if (!editing) return [];
    const brand = brands.find((b) => b.slug === editing.brand_slug || b.name === editing.brand);
    const opts = (brand?.product_lines || []).map((pl) => ({
      value: pl.name, label: pl.name, meta: slugify(pl.name),
    }));
    if (editing.product_line && !opts.some((o) => o.value === editing.product_line)) {
      opts.unshift({ value: editing.product_line, label: editing.product_line, meta: slugify(editing.product_line) });
    }
    return opts;
  }, [brands, editing]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>([...GUIDE_CATEGORIES]);
    for (const r of rows) if (r.category) set.add(r.category);
    if (editing?.category) set.add(editing.category);
    return Array.from(set).sort().map((c) => ({ value: c, label: c }));
  }, [rows, editing?.category]);

  const uploadFeatured = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", editing.title || "Featured image");
      const res = await fetch("/api/admin/upload", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setEditing({ ...editing, featured_image_url: data.url });
      else setMessage(data.error || "Upload failed");
    } catch {
      setMessage("Upload network error");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.slug.trim() || !editing.brand_slug.trim()) {
      setMessage("Title, slug, and brand are required.");
      return;
    }
    setSaving(true); setMessage("");
    try {
      const payload = {
        ...editing,
        article: (editing.article || []).filter((p) => p.trim()),
        faqs: (editing.faqs || []).filter((f) => f.q.trim()),
        versions: (editing.versions || []).map((v, vi) => ({
          id: v.id || `v-${vi}`,
          label: v.label,
          steps: (v.steps || []).map((s, si) => {
            let imageUrl = typeof s.imageUrl === "string" ? s.imageUrl.trim() : "";
            if (imageUrl.startsWith("data:")) imageUrl = "";
            return {
              id: s.id || si + 1,
              instruction: s.instruction || "",
              highlight: s.highlight || "",
              detail: s.detail || "",
              imageUrl: imageUrl || null,
              markerX: s.markerX != null ? Number(s.markerX) : null,
              markerY: s.markerY != null ? Number(s.markerY) : null,
            };
          }),
        })),
        related: editing.related || [],
        compatible_devices: editing.compatible_devices || [],
        read_time: estimateReadTime(editing.article, editing.versions),
        updated_label: formatUpdatedLabel(),
      };
      const isNew = !editing.id;
      const res = await fetch("/api/admin/content/guides", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else {
        setMessage(payload.published ? "Saved & published" : "Saved as draft");
        setEditing(null);
        await load();
      }
    } catch { setMessage("Network error"); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this guide permanently?")) return;
    const res = await fetch(`/api/admin/content/guides?id=${encodeURIComponent(id)}`, {
      method: "DELETE", credentials: "include",
    });
    if (res.ok) await load();
  };

  const seed = async () => {
    setSeeding(true); setMessage("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Seed failed");
      else { setMessage(`Seeded: ${JSON.stringify(data.results)}`); await load(); }
    } catch { setMessage("Seed network error"); }
    finally { setSeeding(false); }
  };

  const filtered = rows.filter((r) => {
    if (filter === "published") return r.published;
    if (filter === "draft") return !r.published;
    return true;
  }).filter((r) => {
    if (!listSearch.trim()) return true;
    const q = listSearch.toLowerCase();
    return [r.title, r.brand, r.slug, r.category, r.product_line].join(" ").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guides</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {usingDb ? <span className="text-emerald-600">Neon connected — edits persist</span>
              : <span className="text-amber-600">DATABASE_URL missing</span>}
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
          <button type="button" onClick={() => { setSlugLocked(false); setEditing(emptyGuide()); }}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
            <Plus className="h-3.5 w-3.5" /> New guide
          </button>
        </div>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "published", "draft"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={filter === f ? "rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]"}>
            {f === "all" ? `All (${rows.length})` : f === "published" ? "Published" : "Drafts"}
          </button>
        ))}
        <input type="search" value={listSearch} onChange={(e) => setListSearch(e.target.value)}
          placeholder="Search guides…" className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-sm" />
      </div>

      {editing && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">{editing.id ? "Edit guide" : "Create guide"}</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Brand → product line → category. Upload screenshot per step (not data URLs). Click to place finger.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="h-4 w-4" />
              {editing.published
                ? <span className="inline-flex items-center gap-1 text-emerald-600"><Eye className="h-3.5 w-3.5" /> Published</span>
                : <span className="inline-flex items-center gap-1 text-amber-600"><EyeOff className="h-3.5 w-3.5" /> Draft</span>}
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Title</span>
            <input value={editing.title}
              onChange={(e) => {
                const title = e.target.value;
                setEditing({ ...editing, title, slug: slugLocked ? editing.slug : slugify(title) });
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="e.g. Add a Fingerprint" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <SearchableSelect label="Brand" value={editing.brand_slug || editing.brand} options={brandOptions}
              help="Search and select a brand"
              onChange={(val, opt) => {
                const brand = brands.find((b) => b.slug === val || b.name === val);
                const name = brand?.name || opt?.label || val;
                const slug = brand?.slug || slugify(name);
                const firstLine = brand?.product_lines?.[0]?.name || editing.product_line;
                setEditing({ ...editing, brand: name, brand_slug: slug, product_line: firstLine });
              }} />
            <SearchableSelect label="Product line" value={editing.product_line} options={productLineOptions}
              help="Lines for the selected brand"
              onChange={(val) => setEditing({ ...editing, product_line: val })} />
            <SearchableSelect label="Category" value={editing.category} options={categoryOptions}
              help="Topic category"
              onChange={(val) => setEditing({ ...editing, category: val })} />
            <label>
              <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                URL slug {slugLocked ? "(manual)" : "(auto)"}
              </span>
              <div className="flex gap-2">
                <input value={editing.slug}
                  onChange={(e) => { setSlugLocked(true); setEditing({ ...editing, slug: slugify(e.target.value) }); }}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm" />
                <button type="button" className="shrink-0 rounded-xl border border-[var(--border)] px-2 text-xs"
                  onClick={() => { setSlugLocked(false); setEditing({ ...editing, slug: slugify(editing.title) }); }}>Auto</button>
              </div>
            </label>
          </div>

          <div className="grid gap-3 rounded-xl bg-[var(--muted)]/40 p-3 sm:grid-cols-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Read time</div>
              <div className="mt-0.5 text-sm font-semibold">{estimateReadTime(editing.article, editing.versions)}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Updated</div>
              <div className="mt-0.5 text-sm font-semibold">{formatUpdatedLabel()}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Modified</div>
              <div className="mt-0.5 text-sm font-semibold">
                {editing.updated_at ? formatModifiedDate(new Date(editing.updated_at)) : formatModifiedDate()}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Featured image</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Used as Open Graph / social share image and shown at the top of the guide.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="url"
                value={editing.featured_image_url || ""}
                onChange={(e) => setEditing({ ...editing, featured_image_url: e.target.value })}
                placeholder="https://… or /api/media/…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-sm font-medium text-brand-600">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFeatured(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {editing.featured_image_url ? (
              <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={editing.featured_image_url} alt="" className="max-h-48 w-full object-cover" />
                <button
                  type="button"
                  className="w-full border-t border-[var(--border)] py-1.5 text-xs text-red-600"
                  onClick={() => setEditing({ ...editing, featured_image_url: "" })}
                >
                  Remove image
                </button>
              </div>
            ) : null}
          </div>

          <RichTextEditor
            label="Introduction (before steps)"
            help="Shown above the live simulator."
            value={editing.short_description}
            onChange={(html) => setEditing({ ...editing, short_description: html })}
            minHeight={200}
          />

          <GuideVersionsEditor
            versions={editing.versions || []}
            onChange={(versions) => setEditing({ ...editing, versions })}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Article paragraphs</h3>
              <button type="button" className="text-xs text-brand-600"
                onClick={() => setEditing({ ...editing, article: [...(editing.article || []), ""] })}>+ Add</button>
            </div>
            <div className="space-y-2">
              {(editing.article || []).map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea value={p} onChange={(e) => {
                    const article = [...editing.article]; article[i] = e.target.value;
                    setEditing({ ...editing, article });
                  }} rows={2} className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
                  <button type="button" className="text-red-500"
                    onClick={() => setEditing({ ...editing, article: editing.article.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <GuideMetaFields
            faqs={editing.faqs || []}
            related={editing.related || []}
            category={editing.category || ""}
            onChangeFaqs={(faqs) => setEditing({ ...editing, faqs })}
            onChangeRelated={(related) => setEditing({ ...editing, related })}
          />

          <SeoMetaBox
            value={{
              focus_keyword: editing.focus_keyword,
              seo_title: editing.seo_title,
              seo_description: editing.seo_description,
              canonical_url: editing.canonical_url,
              robots_index: editing.robots_index,
              robots_follow: editing.robots_follow,
              og_title: editing.og_title,
              og_description: editing.og_description,
              og_image: editing.og_image,
            }}
            onChange={(seo) => setEditing({ ...editing, ...seo })}
            defaultTitle={`${editing.brand}: ${editing.title || "Guide title"}`}
            defaultDescription={(editing.short_description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)}
            pathPreview={previewHref(editing) || `/${editing.brand_slug || "brand"}/${editing.slug || "slug"}`}
            imageUrl={editing.featured_image_url || undefined}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} disabled={saving || !usingDb}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save to database
            </button>
            {previewHref(editing) && (
              <Link href={previewHref(editing)!} target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm">
                <ExternalLink className="h-4 w-4" /> Preview
              </Link>
            )}
            <button type="button" onClick={() => setEditing(null)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : !editing ? (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                <th className="px-3 py-2.5 font-medium">Title</th>
                <th className="px-3 py-2.5 font-medium">Brand</th>
                <th className="px-3 py-2.5 font-medium">Category</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((r) => (
                <tr key={r.id || r.slug} className="hover:bg-[var(--muted)]/30">
                  <td className="px-3 py-2.5 font-medium">{r.title}</td>
                  <td className="px-3 py-2.5">{r.brand}</td>
                  <td className="px-3 py-2.5 text-[var(--muted-foreground)]">{r.category}</td>
                  <td className="px-3 py-2.5">
                    {r.published ? (
                      <span className="text-emerald-600">Published</span>
                    ) : (
                      <span className="text-amber-600">Draft</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <button type="button" onClick={() => { setSlugLocked(true); setEditing({ ...emptyGuide(), ...r }); }}
                      className="mr-2 text-brand-600">Edit</button>
                    {r.id && (
                      <button type="button" onClick={() => remove(String(r.id))} className="text-red-600" aria-label="Delete">
                        <Trash2 className="inline h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[var(--muted-foreground)]">
                    No guides yet. Click “New guide” or Seed DB.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
