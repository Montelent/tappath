"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
import MenuEditor from "@/components/admin/MenuEditor";
import { SITE_SETTINGS_DEFAULTS, type SiteSettings } from "@/lib/site-settings";

export default function MenusSettings() {
  const [settings, setSettings] = useState<SiteSettings>({ ...SITE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backend, setBackend] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings", { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load menus");
      setBackend(data.backend || "");
      setSettings({ ...SITE_SETTINGS_DEFAULTS, ...(data.settings || {}) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings: { nav_items: settings.nav_items, footer_items: settings.footer_items } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Menu save failed");
      setMessage("Menus saved. The public header and footer will update shortly.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menus</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Manage your website navigation like WordPress. Add links, create dropdowns and arrange their order.</p>
          <p className="mt-1 text-xs">{backend === "neon" ? <span className="text-emerald-600">Stored in Neon · live site menus</span> : <span className="text-amber-600">Database required to save menu changes</span>}</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>

      {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>}
      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div><h2 className="text-base font-semibold">Header Menu</h2><p className="mt-1 text-xs text-[var(--muted-foreground)]">Main navigation shown at the top of the website. Add sub-links to create dropdown menus.</p></div>
        <MenuEditor label="Header menu items" help="Items appear in the order shown. Sub-links become dropdown entries." items={settings.nav_items || []} onChange={(items) => setSettings((s) => ({ ...s, nav_items: items }))} />
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div><h2 className="text-base font-semibold">Footer Menu</h2><p className="mt-1 text-xs text-[var(--muted-foreground)]">Links displayed in the Browse column of the website footer. Sub-links are supported.</p></div>
        <MenuEditor label="Footer menu items" help="Add links, reorder them or group related links under a parent." items={settings.footer_items || []} onChange={(items) => setSettings((s) => ({ ...s, footer_items: items }))} />
      </section>

      <div className="flex flex-wrap items-center gap-3 pb-8">
        <button type="button" onClick={save} disabled={saving || backend !== "neon"} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save menus
        </button>
        <span className="text-xs text-[var(--muted-foreground)]">Changes are saved to your site settings.</span>
      </div>
    </div>
  );
}
