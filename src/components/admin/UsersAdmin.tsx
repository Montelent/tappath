"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Shield, User } from "lucide-react";
import {
  AdminLoading,
  AdminNotice,
  AdminPageHeader,
  AdminSecondaryButton,
  AdminTable,
} from "./AdminUI";

type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
};

function formatJoined(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

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
        setUsingDb(!!data.usingSupabase || !!data.usingDb);
        if (data.error) setError(data.error);
      }
    } catch {
      setError("Network error - check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setRole = async (user: Profile, role: "user" | "admin") => {
    if (role === "user" && !confirm(`Remove admin access for ${user.email}?`)) return;
    if (role === "admin" && !confirm(`Make ${user.email} an admin? They can edit the whole site.`))
      return;
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
        setMessage(`${user.email} is now ${role === "admin" ? "an admin" : "a regular user"}.`);
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Users and Roles"
        description={
          <>
            Promote people to admin so they can edit content, or demote them to regular users.{" "}
            {usingDb ? (
              <span className="text-[#00a32a]">Database connected</span>
            ) : (
              <span className="text-[#dba617]">Database not connected</span>
            )}
          </>
        }
        actions={
          <AdminSecondaryButton onClick={() => load()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh list
          </AdminSecondaryButton>
        }
      />

      {message && <AdminNotice tone="ok">{message}</AdminNotice>}
      {error && <AdminNotice tone="warn">{error}</AdminNotice>}

      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <AdminNotice tone="info">
          No users found yet. When someone signs up on the public site, they will appear here.
        </AdminNotice>
      ) : (
        <AdminTable headers={["Name", "Email", "Role", "Joined", "Actions"]}>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7]">
              <td className="px-3 py-2.5 text-[13px] font-medium text-[#1d2327]">{u.name || "-"}</td>
              <td className="px-3 py-2.5 text-[12px] text-[#1d2327]">{u.email}</td>
              <td className="px-3 py-2.5 text-[13px] text-[#1d2327]">
                {u.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded bg-[#fcf9e8] px-2 py-0.5 text-[11px] font-semibold text-[#996800]">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-[#f0f0f1] px-2 py-0.5 text-[11px] font-medium text-[#50575e]">
                    <User className="h-3 w-3" /> User
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 text-[12px] text-[#646970]">{formatJoined(u.created_at)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right text-[13px]">
                {u.role === "admin" ? (
                  <button
                    type="button"
                    disabled={busy === u.id}
                    onClick={() => setRole(u, "user")}
                    className="font-medium text-[#b32d2e] hover:underline"
                  >
                    Demote to user
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy === u.id}
                    onClick={() => setRole(u, "admin")}
                    className="font-medium text-[#2271b1] hover:underline"
                  >
                    Make admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
