import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { hashPassword } from "@/lib/crypto";

/**
 * WordPress-style user update: name, email, role, optional new password.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  let body: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const name = body.name !== undefined ? String(body.name).trim() : undefined;
  const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;
  const role =
    body.role === "admin" ? "admin" : body.role === "user" ? "user" : undefined;
  const password = body.password !== undefined ? String(body.password) : undefined;

  if (admin.id === id && role === "user") {
    return NextResponse.json(
      { error: "You cannot demote your own account while signed in." },
      { status: 400 }
    );
  }

  if (email !== undefined && (email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))) {
    return NextResponse.json({ error: "Enter a valid email address (max 254 characters)." }, { status: 400 });
  }
  if (name !== undefined && name.length > 80) {
    return NextResponse.json({ error: "Name must be 80 characters or fewer." }, { status: 400 });
  }
  if (password !== undefined && password.length > 0 && (password.length < 8 || password.length > 128)) {
    return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }

  const sql = getSql()!;
  try {
    const current = (await sql`
      SELECT id, email, name, role, created_at::text
      FROM profiles WHERE id::text = ${id} LIMIT 1
    `) as { id: string; email: string; name: string; role: string; created_at: string }[];
    if (!current[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const cur = current[0];
    const nextName = name !== undefined ? name || cur.name : cur.name;
    const nextEmail = email !== undefined ? email : cur.email;
    const nextRole = role !== undefined ? role : cur.role === "admin" ? "admin" : "user";

    if (nextEmail !== cur.email) {
      const clash = await sql`
        SELECT id FROM profiles WHERE lower(email) = ${nextEmail} AND id::text <> ${id} LIMIT 1
      `;
      if (clash[0]) {
        return NextResponse.json({ error: "That email is already registered." }, { status: 400 });
      }
    }

    if (password && password.length >= 8) {
      const passwordHash = hashPassword(password);
      await sql`
        UPDATE profiles
        SET name = ${nextName}, email = ${nextEmail}, role = ${nextRole}, password_hash = ${passwordHash}
        WHERE id::text = ${id}
      `;
    } else {
      await sql`
        UPDATE profiles
        SET name = ${nextName}, email = ${nextEmail}, role = ${nextRole}
        WHERE id::text = ${id}
      `;
    }

    const rows = (await sql`
      SELECT id, email, name, role, created_at::text
      FROM profiles WHERE id::text = ${id} LIMIT 1
    `) as { id: string; email: string; name: string; role: string; created_at: string }[];

    return NextResponse.json({ user: rows[0] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}
