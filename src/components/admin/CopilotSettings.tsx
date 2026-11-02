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
      else setMessage("Copilot settings saved. Changes apply on the public chat widget right away.");
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
        description="Control the help chat on the public site. API keys stay in Vercel environment variables — you only toggle preferences here."
        actions={
          <AdminSecondaryButton onClick={() => load()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh status
          </AdminSecondaryButton>
        }
      />

      {message && (
        <AdminNotice tone={message.includes("failed") || message.includes("error") ? "err" : "ok"}>
          {message}
        </AdminNotice>
      )}

      <AdminPanel
        title="API keys status"
        description="Keys are set on Vercel (not in this form). Green = ready to use."
      >
        <ul className="space-y-2 text-[13px]">
          {(["openai", "openrouter", "agentrouter"] as const).map((p) => (
            <li
              key={p}
              className="flex items-center justify-between border-b border-[#f0f0f1] py-2 last:border-0"
            >
              <span className="font-medium capitalize text-[#1d2327]">{p}</span>
              {env?.providers?.[p] ? (
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
        <p className={wp.help + " !mb-0"}>
          On Vercel set one of: OPENAI_API_KEY, OPENROUTER_API_KEY, or AGENTROUTER_API_KEY. Optional:
          COPILOT_PROVIDER=openai|openrouter|agentrouter
        </p>
      </AdminPanel>

      <AdminPanel
        title="Preferences"
        description="These options are stored in the database and control the public chat widget."
        footer={
          <AdminPrimaryButton onClick={save} loading={saving}>
            <Save className="h-4 w-4" /> Save Changes
          </AdminPrimaryButton>
        }
      >
        <label className="flex items-center gap-2 text-[13px] text-[#1d2327]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"
          />
          Show Copilot chat on the public website
        </label>

        <AdminField
          label="Preferred AI provider"
          help="Leave on Auto unless you want to force one provider."
        >
          <AdminSelect value={preferred} onChange={(e) => setPreferred(e.target.value)}>
            <option value="">Auto (first available key)</option>
            <option value="openai">OpenAI</option>
            <option value="openrouter">OpenRouter</option>
            <option value="agentrouter">AgentRouter</option>
          </AdminSelect>
        </AdminField>

        <AdminField
          label="Extra instructions for the AI"
          help="Optional. Example: “Always mention the exact Settings menu path for Samsung phones.”"
        >
          <AdminTextarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={4}
            placeholder="Optional extra system instructions…"
          />
        </AdminField>
      </AdminPanel>
    </div>
  );
}
