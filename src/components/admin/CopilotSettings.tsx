"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, Save, X } from "lucide-react";
import {
  AdminField,
  AdminLoading,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminSelect,
  AdminTextarea,
  wp,
} from "./AdminUI";

type FormState = {
  enabled: boolean;
  preferred: string;
  extra: string;
  openai_api_key: string;
  openai_model: string;
  openai_base_url: string;
  openrouter_api_key: string;
  openrouter_model: string;
  agentrouter_api_key: string;
  agentrouter_base_url: string;
  agentrouter_model: string;
  openai_set: boolean;
  openrouter_set: boolean;
  agentrouter_set: boolean;
};

const empty: FormState = {
  enabled: true,
  preferred: "",
  extra: "",
  openai_api_key: "",
  openai_model: "",
  openai_base_url: "",
  openrouter_api_key: "",
  openrouter_model: "",
  agentrouter_api_key: "",
  agentrouter_base_url: "",
  agentrouter_model: "",
  openai_set: false,
  openrouter_set: false,
  agentrouter_set: false,
};

export default function CopilotSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<FormState>(empty);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/copilot-config", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        const db = data.db || {};
        setForm({
          enabled: db.enabled !== false,
          preferred: String(db.preferred_provider || ""),
          extra: String(db.system_prompt_extra || ""),
          openai_api_key: "",
          openai_model: String(db.openai_model || data.env?.models?.openai || ""),
          openai_base_url: String(db.openai_base_url || ""),
          openrouter_api_key: "",
          openrouter_model: String(db.openrouter_model || data.env?.models?.openrouter || ""),
          agentrouter_api_key: "",
          agentrouter_base_url: String(db.agentrouter_base_url || ""),
          agentrouter_model: String(db.agentrouter_model || data.env?.models?.agentrouter || ""),
          openai_set: !!db.openai_api_key_set || !!data.env?.providers?.openai,
          openrouter_set: !!db.openrouter_api_key_set || !!data.env?.providers?.openrouter,
          agentrouter_set: !!db.agentrouter_api_key_set || !!data.env?.providers?.agentrouter,
        });
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
          enabled: form.enabled,
          preferred_provider: form.preferred,
          system_prompt_extra: form.extra,
          openai_api_key: form.openai_api_key,
          openai_model: form.openai_model,
          openai_base_url: form.openai_base_url,
          openrouter_api_key: form.openrouter_api_key,
          openrouter_model: form.openrouter_model,
          agentrouter_api_key: form.agentrouter_api_key,
          agentrouter_base_url: form.agentrouter_base_url,
          agentrouter_model: form.agentrouter_model,
        }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else {
        setMessage("Copilot settings saved. Keys are stored in the database.");
        setForm((f) => ({
          ...f,
          openai_api_key: "",
          openrouter_api_key: "",
          agentrouter_api_key: "",
        }));
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className={wp.page + " mx-auto max-w-2xl"}>
      <AdminPageHeader
        title="Copilot (AI Chat)"
        description="Set API keys and models here. Values are saved in the database. Environment variables are only a fallback."
        actions={
          <AdminSecondaryButton onClick={() => load()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </AdminSecondaryButton>
        }
      />

      {message && <AdminNotice tone="ok">{message}</AdminNotice>}

      <AdminPanel title="Status">
        <ul className="space-y-1 text-[13px]">
          {(
            [
              ["openai", form.openai_set],
              ["openrouter", form.openrouter_set],
              ["agentrouter", form.agentrouter_set],
            ] as const
          ).map(([p, ok]) => (
            <li
              key={p}
              className="flex items-center justify-between border-b border-[#f0f0f1] py-2 last:border-0"
            >
              <span className="font-medium capitalize text-[#1d2327]">{p}</span>
              {ok ? (
                <span className="inline-flex items-center gap-1 text-[#00a32a]">
                  <Check className="h-4 w-4" /> Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#646970]">
                  <X className="h-4 w-4" /> Not set
                </span>
              )}
            </li>
          ))}
        </ul>
      </AdminPanel>

      <AdminPanel
        title="API keys and models"
        description="Paste a new key to replace the saved one. Leave a key field blank to keep the current key."
        footer={
          <AdminPrimaryButton onClick={save} loading={saving}>
            <Save className="h-4 w-4" /> Save Changes
          </AdminPrimaryButton>
        }
      >
        <label className="flex items-center gap-2 text-[13px] text-[#1d2327]">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
            className="h-4 w-4 rounded border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"
          />
          Show Copilot chat on the public website
        </label>

        <AdminField label="Preferred AI provider" help="Auto tries the first provider that has a key.">
          <AdminSelect value={form.preferred} onChange={(e) => set("preferred", e.target.value)}>
            <option value="">Auto</option>
            <option value="openai">OpenAI</option>
            <option value="openrouter">OpenRouter</option>
            <option value="agentrouter">AgentRouter</option>
          </AdminSelect>
        </AdminField>

        <div className="rounded border border-[#c3c4c7] bg-[#f6f7f7] p-3 space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#646970]">AgentRouter</p>
          <AdminField label="API key">
            <input
              type="password"
              className={wp.input}
              autoComplete="off"
              placeholder={form.agentrouter_set ? "•••• saved ••••" : "sk-…"}
              value={form.agentrouter_api_key}
              onChange={(e) => set("agentrouter_api_key", e.target.value)}
            />
          </AdminField>
          <AdminField label="Base URL" help="Usually https://agentrouter.org/v1">
            <input
              className={wp.input}
              placeholder="https://agentrouter.org/v1"
              value={form.agentrouter_base_url}
              onChange={(e) => set("agentrouter_base_url", e.target.value)}
            />
          </AdminField>
          <AdminField label="Model">
            <input
              className={wp.input}
              placeholder="gpt-4o-mini"
              value={form.agentrouter_model}
              onChange={(e) => set("agentrouter_model", e.target.value)}
            />
          </AdminField>
        </div>

        <div className="rounded border border-[#c3c4c7] bg-[#f6f7f7] p-3 space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#646970]">OpenAI</p>
          <AdminField label="API key">
            <input
              type="password"
              className={wp.input}
              autoComplete="off"
              placeholder={form.openai_set ? "•••• saved ••••" : "sk-…"}
              value={form.openai_api_key}
              onChange={(e) => set("openai_api_key", e.target.value)}
            />
          </AdminField>
          <AdminField label="Base URL">
            <input
              className={wp.input}
              placeholder="https://api.openai.com/v1"
              value={form.openai_base_url}
              onChange={(e) => set("openai_base_url", e.target.value)}
            />
          </AdminField>
          <AdminField label="Model">
            <input
              className={wp.input}
              placeholder="gpt-4o-mini"
              value={form.openai_model}
              onChange={(e) => set("openai_model", e.target.value)}
            />
          </AdminField>
        </div>

        <div className="rounded border border-[#c3c4c7] bg-[#f6f7f7] p-3 space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#646970]">OpenRouter</p>
          <AdminField label="API key">
            <input
              type="password"
              className={wp.input}
              autoComplete="off"
              placeholder={form.openrouter_set ? "•••• saved ••••" : "sk-or-…"}
              value={form.openrouter_api_key}
              onChange={(e) => set("openrouter_api_key", e.target.value)}
            />
          </AdminField>
          <AdminField label="Model">
            <input
              className={wp.input}
              placeholder="openai/gpt-4o-mini"
              value={form.openrouter_model}
              onChange={(e) => set("openrouter_model", e.target.value)}
            />
          </AdminField>
        </div>

        <AdminField label="Extra instructions for the AI">
          <AdminTextarea
            value={form.extra}
            onChange={(e) => set("extra", e.target.value)}
            rows={4}
            placeholder="Optional extra system instructions…"
          />
        </AdminField>
      </AdminPanel>
    </div>
  );
}
