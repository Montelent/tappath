"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, RefreshCw, Check, X } from "lucide-react";

export default function CopilotSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [env, setEnv] = useState<{
    providers: Record<string, boolean>;
    preferred: string | null;
    models: Record<string, string>;
  } | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [preferred, setPreferred] = useState("");
  const [extra, setExtra] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/copilot-config", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setEnv(data.env);
        setEnabled(data.db?.enabled !== false);
        setPreferred(String(data.db?.preferred_provider || data.env?.preferred || ""));
        setExtra(String(data.db?.system_prompt_extra || ""));
      }
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
      const res = await fetch("/api/admin/copilot-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          enabled,
          preferred_provider: preferred,
          system_prompt_extra: extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else setMessage("Copilot preferences saved to Neon");
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
        <h1 className="text-2xl font-bold tracking-tight">Copilot settings</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          API keys stay in Vercel env. Preferences below save to Neon.
        </p>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">Provider keys (Vercel env)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(["openai", "openrouter", "agentrouter"] as const).map((p) => (
            <li key={p} className="flex items-center justify-between">
              <span className="capitalize">{p}</span>
              {env?.providers?.[p] ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <Check className="h-4 w-4" /> Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[var(--muted-foreground)]">
                  <X className="h-4 w-4" /> Missing
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Set OPENAI_API_KEY, OPENROUTER_API_KEY, or AGENTROUTER_API_KEY on Vercel.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
          Copilot enabled on public site
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Preferred provider</span>
          <select
            value={preferred}
            onChange={(e) => setPreferred(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="">Auto (first available key)</option>
            <option value="openai">OpenAI</option>
            <option value="openrouter">OpenRouter</option>
            <option value="agentrouter">AgentRouter</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Extra system instructions</span>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
    </div>
  );
}
