"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Shield, User } from "lucide-react";
import {
  AdminLoading,
  AdminNotice,
  AdminPageHeader,
  AdminSecondaryButton,
  AdminTable,
  wp,
} from "./AdminUI";

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
        setUsingDb(!!data.usingSupabase || !!data.usingDb);
        if (data.error) setError(data.error);
      }
    } catch {
      setError("Network error — check your connection and try again.");
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
    <div className={wp.page}>
      <AdminPageHeader
        title="Users & Roles"
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
            <tr key={u.id} className={wp.tr}>
              <td className={wp.td + " font-medium"}>{u.name || "—"}</td>
              <td className={wp.td + " text-[12px]"}>{u.email}</td>
              <td className={wp.td}>
                {u.role === "admin" ? (
                  <span className={wp.badgeAdmin}>
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  <span className={wp.badgeUser}>
                    <User className="h-3 w-3" /> User
                  </span>
                )}
              </td>
              <td className={wp.td + " text-[12px] text-[#646970]"}>
                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
              </td>
              <td className={wp.td + " text-right whitespace-nowrap"}>
                {u.role === "admin" ? (
                  <button
                    type="button"
                    disabled={busy === u.id}
                    onClick={() => setRole(u, "user")}
                    className={wp.link + " text-[#b32d2e]"}
                  >
                    Demote to user
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy === u.id}
                    onClick={() => setRole(u, "admin")}
                    className={wp.link}
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
