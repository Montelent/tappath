"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Shield, User } from "lucide-react";

type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
};

export default function UsersAdmin() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDb, setUsingDb] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content/profiles", { credentials: "include" });
      const data = await res.json();
      if (!res.ok && data.error && !data.rows) {
        setError(data.error);
        setUsingDb(false);
      } else {
        setRows((data.rows || []) as Profile[]);
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

  const setRole = async (user: Profile, role: "user" | "admin") => {
    if (role === "user" && !confirm(`Demote ${user.email} to regular user?`)) return;
    if (role === "admin" && !confirm(`Promote ${user.email} to admin?`)) return;
    setBusy(user.id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: user.id, role }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Update failed");
      else {
        setMessage(`${user.email} is now ${role}`);
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & roles</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Promote or demote admins.{" "}
            {usingDb ? (
              <span className="text-emerald-600">Neon connected</span>
            ) : (
              <span className="text-amber-600">DATABASE_URL missing</span>
            )}
          </p>
        </div>
        <button type="button" onClick={() => load()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {message && <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">{message}</p>}
      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{error}</p>
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
                <th className="px-3 py-2.5">User</th>
                <th className="px-3 py-2.5">Email</th>
                <th className="px-3 py-2.5">Role</th>
                <th className="px-3 py-2.5">Joined</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--muted)]/30">
                  <td className="px-3 py-2.5 font-medium">{u.name || "—"}</td>
                  <td className="px-3 py-2.5 text-xs">{u.email}</td>
                  <td className="px-3 py-2.5">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">
                        <User className="h-3 w-3" /> User
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)]">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    {u.role === "admin" ? (
                      <button type="button" disabled={!usingDb || busy === u.id} onClick={() => setRole(u, "user")} className="text-xs text-[var(--muted-foreground)] hover:text-red-600">
                        Demote
                      </button>
                    ) : (
                      <button type="button" disabled={!usingDb || busy === u.id} onClick={() => setRole(u, "admin")} className="text-xs text-brand-600">
                        Make admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[var(--muted-foreground)]">
                    No users in database. Sign-ups and demo accounts appear after Neon is connected.
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
