"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Shield, User, Pencil, X } from "lucide-react";
import {
  AdminLoading,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
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
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    password2: "",
  });

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

  const openEdit = (u: Profile) => {
    setEditing(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role === "admin" ? "admin" : "user",
      password: "",
      password2: "",
    });
    setMessage("");
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({ name: "", email: "", role: "user", password: "", password2: "" });
  };

  const saveUser = async () => {
    if (!editing) return;
    if (form.password && form.password !== form.password2) {
      setMessage("Passwords do not match.");
      return;
    }
    if (form.password && form.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: editing.id,
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Update failed");
      } else {
        setMessage("User updated.");
        closeEdit();
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Users"
        description={
          <>
            Manage accounts that can sign in. Edit name, email, role, and password.{" "}
            {usingDb ? (
              <span className="text-[#00a32a]">Database connected</span>
            ) : (
              <span className="text-[#dba617]">Database not connected</span>
            )}
          </>
        }
        actions={
          <AdminSecondaryButton onClick={() => load()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </AdminSecondaryButton>
        }
      />

      {message && <AdminNotice tone="ok">{message}</AdminNotice>}
      {error && <AdminNotice tone="warn">{error}</AdminNotice>}

      {editing && (
        <AdminPanel
          title={`Edit user: ${editing.email}`}
          description="Leave password blank to keep the current password."
          footer={
            <div className="flex flex-wrap gap-2">
              <AdminPrimaryButton disabled={busy} onClick={() => saveUser()}>
                {busy ? "Saving…" : "Update user"}
              </AdminPrimaryButton>
              <AdminSecondaryButton onClick={closeEdit}>
                <X className="h-3.5 w-3.5" /> Cancel
              </AdminSecondaryButton>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={wp.label}>Display name</label>
              <input
                className={wp.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className={wp.label}>Email</label>
              <input
                type="email"
                className={wp.input}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className={wp.label}>Role</label>
              <select
                className={wp.select}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="user">Subscriber (User)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={wp.label}>New password</label>
                <input
                  type="password"
                  className={wp.input}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div>
                <label className={wp.label}>Confirm password</label>
                <input
                  type="password"
                  className={wp.input}
                  autoComplete="new-password"
                  value={form.password2}
                  onChange={(e) => setForm((f) => ({ ...f, password2: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </AdminPanel>
      )}

      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <AdminNotice tone="info">
          No users found yet. When someone signs up on the public site, they will appear here.
        </AdminNotice>
      ) : (
        <AdminTable headers={["Name", "Email", "Role", "Joined", ""]}>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7]">
              <td className="px-3 py-2.5 text-[13px] font-medium text-[#1d2327]">{u.name || "-"}</td>
              <td className="px-3 py-2.5 text-[12px] text-[#1d2327]">{u.email}</td>
              <td className="px-3 py-2.5 text-[13px] text-[#1d2327]">
                {u.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded bg-[#fcf9e8] px-2 py-0.5 text-[11px] font-semibold text-[#996800]">
                    <Shield className="h-3 w-3" /> Administrator
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-[#f0f0f1] px-2 py-0.5 text-[11px] font-medium text-[#50575e]">
                    <User className="h-3 w-3" /> Subscriber
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 text-[12px] text-[#646970]">{formatJoined(u.created_at)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right text-[13px]">
                <button
                  type="button"
                  onClick={() => openEdit(u)}
                  className="inline-flex items-center gap-1 font-medium text-[#2271b1] hover:underline"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
