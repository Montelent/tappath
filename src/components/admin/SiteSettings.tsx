"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, RefreshCw } from "lucide-react";

type Settings = {
  site_name: string;
  site_tagline: string;
  support_email: string;
  homepage_hero_title: string;
  homepage_hero_subtitle: string;
  maintenance_mode: boolean;
  allow_signups: boolean;
  default_locale: string;
};

const EMPTY: Settings = {
  site_name: "TapPath",
  site_tagline: "",
  support_email: "",
  homepage_hero_title: "",
  homepage_hero_subtitle: "",
  maintenance_mode: false,
  allow_signups: true,
  default_locale: "en",
};

export default function SiteSettings() {
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backend, setBackend] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to load");
      else {
        setBackend(data.backend || "");
        setSettings({ ...EMPTY, ...(data.settings || {}) });
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
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else setMessage("Settings saved to Neon");
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site settings</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {backend === "neon" ? (
            <span className="text-emerald-600">Stored in Neon site_settings</span>
          ) : (
            <span className="text-amber-600">Mock defaults (set DATABASE_URL for persistence)</span>
          )}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </p>
      )}
      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}

      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        {(
          [
            ["site_name", "Site name"],
            ["site_tagline", "Tagline"],
            ["support_email", "Support email"],
            ["homepage_hero_title", "Homepage hero title"],
            ["homepage_hero_subtitle", "Homepage hero subtitle"],
            ["default_locale", "Default locale (en / de)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
            <input
              value={String(settings[key] ?? "")}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </label>
        ))}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!settings.maintenance_mode}
            onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
            className="h-4 w-4"
          />
          Maintenance mode
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!settings.allow_signups}
            onChange={(e) => setSettings({ ...settings, allow_signups: e.target.checked })}
            className="h-4 w-4"
          />
          Allow new user sign-ups
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || backend !== "neon"}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
    </div>
  );
}
