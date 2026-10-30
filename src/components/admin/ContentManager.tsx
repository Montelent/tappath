"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, RefreshCw, Database } from "lucide-react";

type Props = {
  table: string;
  title: string;
  columns: { key: string; label: string }[];
  emptyRow: Record<string, unknown>;
  fields: { key: string; label: string; type?: "text" | "textarea" | "number" | "boolean" | "json" }[];
};

export default function ContentManager({ table, title, columns, emptyRow, fields }: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/content/${table}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok && data.error && !data.rows) {
        setError(data.error);
        setRows([]);
      } else {
        setRows(data.rows || []);
        setUsingDb(!!data.usingSupabase);
        if (data.error) setError(data.error);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setMessage("");
    try {
      const isNew = !editing.id;
      const res = await fetch(`/api/admin/content/${table}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Save failed");
      } else {
        setMessage("Saved");
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
    if (!confirm("Delete this row?")) return;
    const res = await fetch(`/api/admin/content/${table}?id=${encodeURIComponent(id)}`, {
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

  const cell = (row: Record<string, unknown>, key: string) => {
    const v = row[key];
    if (v == null) return "—";
    if (typeof v === "object") return JSON.stringify(v).slice(0, 60);
    return String(v).slice(0, 80);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {usingDb ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Database className="h-3.5 w-3.5" /> Neon connected
              </span>
            ) : (
              <span className="text-amber-600">
                DATABASE_URL not set — add Neon connection string on Vercel, then Seed
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={seed}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"
          >
            {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
            Seed from mock data
          </button>
          <button
            type="button"
            onClick={() => setEditing({ ...emptyRow })}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>
      )}
      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </p>
      )}

      {editing && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-4 font-semibold">{editing.id ? "Edit" : "Create"}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className={f.type === "textarea" || f.type === "json" ? "sm:col-span-2" : ""}>
                <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                  {f.label}
                </span>
                {f.type === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={!!editing[f.key]}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })}
                    className="h-4 w-4"
                  />
                ) : f.type === "textarea" || f.type === "json" ? (
                  <textarea
                    value={
                      f.type === "json"
                        ? typeof editing[f.key] === "string"
                          ? (editing[f.key] as string)
                          : JSON.stringify(editing[f.key] ?? "", null, 2)
                        : String(editing[f.key] ?? "")
                    }
                    onChange={(e) => {
                      if (f.type === "json") {
                        try {
                          setEditing({ ...editing, [f.key]: JSON.parse(e.target.value) });
                        } catch {
                          setEditing({ ...editing, [f.key]: e.target.value });
                        }
                      } else {
                        setEditing({ ...editing, [f.key]: e.target.value });
                      }
                    }}
                    rows={f.type === "json" ? 8 : 3}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm"
                  />
                ) : (
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={String(editing[f.key] ?? "")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        [f.key]:
                          f.type === "number" ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                )}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
            >
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
                {columns.map((c) => (
                  <th key={c.key} className="px-3 py-2.5 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-[var(--muted)]/30">
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2.5">
                      {cell(row, c.key)}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditing({ ...row })}
                      className="mr-2 text-brand-600 dark:text-brand-400"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(String(row.id))}
                      className="text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 className="inline h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-3 py-8 text-center text-[var(--muted-foreground)]"
                  >
                    No rows. Set DATABASE_URL and click “Seed from mock data”.
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
