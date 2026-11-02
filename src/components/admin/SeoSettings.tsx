"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Search, ExternalLink } from "lucide-react";
import type { SeoRedirect, SiteSettings } from "@/lib/site-settings";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/site-settings";

type Settings = SiteSettings;

export default function SeoSettings() {
  const [settings, setSettings] = useState<Settings>({ ...SITE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [backend, setBackend] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      const data = await res.json();
      if (data.settings) setSettings({ ...SITE_SETTINGS_DEFAULTS, ...data.settings });
      setBackend(data.backend || "");
    } catch {
      setMessage("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          settings: {
            meta_title: settings.meta_title,
            meta_description: settings.meta_description,
            meta_keywords: settings.meta_keywords,
            seo_title_separator: settings.seo_title_separator,
            seo_robots_index: settings.seo_robots_index,
            seo_robots_follow: settings.seo_robots_follow,
            seo_canonical_host: settings.seo_canonical_host,
            seo_google_verification: settings.seo_google_verification,
            seo_bing_verification: settings.seo_bing_verification,
            seo_yandex_verification: settings.seo_yandex_verification,
            seo_pinterest_verification: settings.seo_pinterest_verification,
            seo_robots_extra: settings.seo_robots_extra,
            seo_redirect_trailing_slash: settings.seo_redirect_trailing_slash,
            seo_force_canonical_host: settings.seo_force_canonical_host,
            seo_redirects: settings.seo_redirects || [],
            og_image_url: settings.og_image_url,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else setMessage("SEO settings saved — they apply on the live site after the next page load.");
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  const redirects: SeoRedirect[] = Array.isArray(settings.seo_redirects) ? settings.seo_redirects : [];

  const updateRedirect = (i: number, patch: Partial<SeoRedirect>) => {
    const next = [...redirects];
    next[i] = { ...next[i], ...patch };
    set("seo_redirects", next);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO settings</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Titles, meta, webmaster tools, and redirects.{backend ? ` · Backend: ${backend}` : ""}
          </p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save SEO
        </button>
      </div>

      {message && <p className="rounded-xl bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Search className="h-4 w-4 text-brand-600" /> Titles & meta description
        </h2>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Homepage / default title</span>
          <input value={settings.meta_title} onChange={(e) => set("meta_title", e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">{settings.meta_title.length}/60 recommended</span>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Meta description</span>
          <textarea value={settings.meta_description} onChange={(e) => set("meta_description", e.target.value)} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">{settings.meta_description.length}/160 recommended</span>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Focus keywords (comma-separated)</span>
          <input value={settings.meta_keywords} onChange={(e) => set("meta_keywords", e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Title separator</span>
            <input value={settings.seo_title_separator} onChange={(e) => set("seo_title_separator", e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" placeholder="·" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Default OG image URL</span>
            <input value={settings.og_image_url} onChange={(e) => set("og_image_url", e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" placeholder="/og.png" />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">Robots & indexing</h2>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.seo_robots_index !== false} onChange={(e) => set("seo_robots_index", e.target.checked)} className="h-4 w-4" />
            Allow search engines to index pages
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.seo_robots_follow !== false} onChange={(e) => set("seo_robots_follow", e.target.checked)} className="h-4 w-4" />
            Allow following links
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Extra robots.txt lines</span>
          <textarea value={settings.seo_robots_extra} onChange={(e) => set("seo_robots_extra", e.target.value)} rows={4} placeholder={"Disallow: /admin/"} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Preferred host (canonical)</span>
          <input value={settings.seo_canonical_host} onChange={(e) => set("seo_canonical_host", e.target.value)} placeholder="https://tappath.com" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!settings.seo_force_canonical_host} onChange={(e) => set("seo_force_canonical_host", e.target.checked)} className="h-4 w-4" />
          Auto-redirect other hosts to preferred host (also set SEO_FORCE_HOST=true on Vercel)
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">Webmaster tools verification</h2>
        <p className="text-xs text-[var(--muted-foreground)]">Paste only the verification content value (not the full meta tag).</p>
        {([
          ["seo_google_verification", "Google Search Console"],
          ["seo_bing_verification", "Bing Webmaster Tools"],
          ["seo_yandex_verification", "Yandex"],
          ["seo_pinterest_verification", "Pinterest"],
        ] as const).map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
            <input value={String(settings[key] || "")} onChange={(e) => set(key, e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm" placeholder="verification code" />
          </label>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Redirects</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Manual 301/302 plus optional trailing-slash cleanup.</p>
          </div>
          <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600" onClick={() => set("seo_redirects", [...redirects, { id: crypto.randomUUID(), from: "", to: "", code: 301, enabled: true }])}>
            <Plus className="h-3.5 w-3.5" /> Add redirect
          </button>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.seo_redirect_trailing_slash !== false} onChange={(e) => set("seo_redirect_trailing_slash", e.target.checked)} className="h-4 w-4" />
          Auto: strip trailing slashes (except homepage) with 301
        </label>
        <div className="space-y-3">
          {redirects.map((r, i) => (
            <div key={r.id || i} className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
              <input value={r.from} onChange={(e) => updateRedirect(i, { from: e.target.value })} placeholder="/old-path" className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm" />
              <input value={r.to} onChange={(e) => updateRedirect(i, { to: e.target.value })} placeholder="/new-path" className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm" />
              <select value={r.code} onChange={(e) => updateRedirect(i, { code: Number(e.target.value) as 301 | 302 })} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm">
                <option value={301}>301</option>
                <option value={302}>302</option>
              </select>
              <label className="inline-flex items-center gap-1 text-xs">
                <input type="checkbox" checked={r.enabled !== false} onChange={(e) => updateRedirect(i, { enabled: e.target.checked })} />
                On
              </label>
              <button type="button" className="text-red-500" onClick={() => set("seo_redirects", redirects.filter((_, j) => j !== i))} aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save all SEO settings
        </button>
      </div>

      <p className="text-center text-xs text-[var(--muted-foreground)]">
        <a href="/robots.txt" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600">
          View robots.txt <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}
