"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, RefreshCw } from "lucide-react";

export default function I18nEditor() {
  const [locale, setLocale] = useState<"en" | "de">("en");
  const [values, setValues] = useState<Record<string, string>>({});
  const [overrideKeys, setOverrideKeys] = useState<string[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/i18n?locale=${locale}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to load");
      else {
        setValues(data.values || {});
        setKeys(data.keys || []);
        setOverrideKeys(data.overrideKeys || []);
        setDirty({});
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const overrides: Record<string, string> = {};
      for (const k of overrideKeys) {
        overrides[k] = dirty[k] ?? values[k];
      }
      for (const [k, v] of Object.entries(dirty)) {
        overrides[k] = v;
      }
      const res = await fetch("/api/admin/i18n", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ locale, overrides }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else {
        setMessage(`Saved ${data.keys} override keys for ${locale}`);
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  const visible = keys.filter(
    (k) =>
      !filter ||
      k.toLowerCase().includes(filter.toLowerCase()) ||
      (dirty[k] ?? values[k] ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">i18n content</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Override UI strings for English / Deutsch. Saved to Neon.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["en", "de"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={
                locale === l
                  ? "rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-full bg-[var(--muted)] px-3 py-1.5 text-sm"
              }
            >
              {l === "en" ? "English" : "Deutsch"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>
      )}
      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter keys…"
          className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || Object.keys(dirty).length === 0}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save overrides ({Object.keys(dirty).length})
        </button>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : (
        <div className="max-h-[70vh] space-y-2 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          {visible.map((key) => {
            const isOverride = overrideKeys.includes(key) || key in dirty;
            const val = dirty[key] ?? values[key] ?? "";
            return (
              <label key={key} className="block border-b border-[var(--border)] pb-2 last:border-0">
                <span className="mb-1 flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)]">
                  {key}
                  {isOverride && (
                    <span className="rounded bg-amber-100 px-1.5 text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-200">override</span>
                  )}
                </span>
                <input
                  value={val}
                  onChange={(e) => setDirty({ ...dirty, [key]: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                />
              </label>
            );
          })}
          {visible.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">No keys match.</p>
          )}
        </div>
      )}
    </div>
  );
}
